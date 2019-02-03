#include <iterator>
#include <napi.h>
#include <ledger/system.hh>
#include <ledger/context.h>
#include <ledger/scope.h>
#include <ledger/journal.h>
#include <ledger/xact.h>
#include <ledger/times.h>
#include <ledger/post.h>
#include <ledger/account.h>

std::string get_state_str(ledger::item_t::state_t state) {
  if (state == ledger::item_t::CLEARED) {
    return "CLEARED";
  }
  if (state == ledger::item_t::PENDING) {
    return "PENDING";
  }

  return "UNCLEARED";
}

void parse_item(Napi::Env &env, Napi::Object &item_js, ledger::item_t *item) {
  item_js.Set("date", Napi::String::New(env, ledger::format_date(item->primary_date(), ledger::FMT_WRITTEN)));
  boost::optional <ledger::date_t> aux_date = item->aux_date();
  item_js.Set("auxDate",
              aux_date ? Napi::String::New(env, ledger::format_date(*aux_date, ledger::FMT_WRITTEN))
                       : env.Null());
  item_js.Set("state", Napi::String::New(env, get_state_str(item->state())));
  item_js.Set("note", item->note ? Napi::String::New(env, *item->note) : env.Null());

  std::vector<std::string> tags_vec;
  Napi::Object metadata = Napi::Object::New(env);
  if (item->metadata) {
    for (ledger::item_t::string_map::value_type pair : *item->metadata) {
      if (pair.second.first) { // is metadata
        std::ostringstream value;
        value << *pair.second.first;
        metadata.Set(pair.first, Napi::String::New(env, value.str()));
      } else { // is tag
        tags_vec.push_back(pair.first);
      }
    }
  }

  Napi::Array tags = Napi::Array::New(env, tags_vec.size());
  for (std::vector<std::string>::iterator tag_it = tags_vec.begin(); tag_it != tags_vec.end(); ++tag_it) {
    tags[(int) std::distance(tags_vec.begin(), tag_it)] = Napi::String::New(env, *tag_it);
  }
  item_js.Set("tags", tags);
  item_js.Set("metadata", metadata);
}

Napi::Object ParseJournalWrapped(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  // Parse the Journal using Ledger
  std::string journal_string = info[0].As<Napi::String>().Utf8Value();
  ledger::parse_context_stack_t parsing_context_stack;
  std::istream *string_stream = new std::istringstream(journal_string);
  boost::shared_ptr <std::istream> stream(string_stream);
  ledger::parse_context_t context = ledger::parse_context_t(stream, boost::filesystem::current_path());
  ledger::journal_t *journal = new ledger::journal_t();
  ledger::scope_t *scope = new ledger::empty_scope_t();
  context.journal = journal;
  context.master = journal->master;
  context.scope = scope;
  parsing_context_stack.push(context);
  journal->read(parsing_context_stack);
  // *****

  Napi::Object parsed_journal = Napi::Object::New(env);
  ledger::xacts_list xacts = journal->xacts;
  Napi::Array transactions = Napi::Array::New(env, xacts.size());
  for (std::list<ledger::xact_t *>::iterator xact_it = xacts.begin(); xact_it != xacts.end(); ++xact_it) {
    ledger::xact_t *xact = *xact_it;
    Napi::Object transaction = Napi::Object::New(env);
    transaction.Set("payee", Napi::String::New(env, xact->payee));
    transaction.Set("code", xact->code ? Napi::String::New(env, *xact->code) : env.Null());
    parse_item(env, transaction, xact);

    Napi::Array postings = Napi::Array::New(env, xact->posts.size());
    for (std::list<ledger::post_t *>::iterator post_it = xact->posts.begin();
         post_it != xact->posts.end(); ++post_it) {
      ledger::post_t *post = *post_it;
      Napi::Object post_js = Napi::Object::New(env);
      post_js.Set("account", Napi::String::New(env, post->account->fullname()));
      post_js.Set("payee", Napi::String::New(env, post->payee()));
      parse_item(env, post_js, post);
      postings[(int) std::distance(xact->posts.begin(), post_it)] = post_js;
    }
    transaction.Set("postings", postings);

    transactions[(int) std::distance(xacts.begin(), xact_it)] = transaction;
  }
  parsed_journal.Set("transactions", transactions);

  delete journal;
  delete scope;

  return parsed_journal;
}

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  ledger::times_initialize();
  ledger::amount_t::initialize();
  ledger::value_t::initialize();

  exports.Set("parseJournal", Napi::Function::New(env, ParseJournalWrapped));

  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, InitAll
)
