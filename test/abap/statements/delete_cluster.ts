import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "DELETE FROM DATABASE lawdivindx(cu) ID 'LAW_CUSTOMER_CREDIT'.",
  "DELETE FROM DATABASE foo(ba) CLIENT sy-mandt ID key.",
];

statementType(tests, "DELETE FROM DATABASE", Statements.DeleteCluster);