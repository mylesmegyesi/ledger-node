#include <iterator>
#include <napi.h>
#include <ledger/system.hh>
#include <ledger/context.h>
#include <ledger/scope.h>
#include <ledger/journal.h>
#include <ledger/xact.h>
#include <ledger/times.h>

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
    for (std::list<ledger::xact_t *>::iterator it = xacts.begin(); it != xacts.end(); ++it) {
        ledger::xact_t xact = **it;
        Napi::Object transaction = Napi::Object::New(env);
        transaction.Set("payee", Napi::String::New(env, xact.payee));
        transaction.Set("code", xact.code ? Napi::String::New(env, *xact.code) : env.Null());
        transaction.Set("date", Napi::String::New(env, ledger::format_date(xact.primary_date(), ledger::FMT_WRITTEN)));
        boost::optional <ledger::date_t> aux_date = xact.aux_date();
        transaction.Set("auxDate",
                        aux_date ? Napi::String::New(env, ledger::format_date(*aux_date, ledger::FMT_WRITTEN))
                                 : env.Null());
        transaction.Set("state", Napi::String::New(env, xact.state() == ledger::item_t::CLEARED ? "CLEARED" : xact.state() == ledger::item_t::PENDING ? "PENDING" : "UNCLEARED"));
        transaction.Set("note", xact.note ? Napi::String::New(env, *xact.note) : env.Null());
        transactions[(int) std::distance(xacts.begin(), it)] = transaction;
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
