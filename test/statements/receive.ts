import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "RECEIVE RESULTS FROM FUNCTION 'ZFOOBAR'\n" +
  " IMPORTING\n" +
  "   ev_foo      = lv_del\n" +
  " EXCEPTIONS\n" +
  "   initial_guid     = 1\n" +
  "   no_authorization = 2\n" +
  "   others           = 3.",

  "RECEIVE RESULTS FROM FUNCTION 'ZFOOBAR'\n" +
  "  KEEPING TASK\n" +
  "  TABLES\n" +
  "    tab = lt_tab.",

];

statementType(tests, "RECEIVE", Statements.Receive);