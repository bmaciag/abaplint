import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class Retry extends Statement {

  public static get_matcher(): IRunnable {
    return str("RETRY");
  }

}