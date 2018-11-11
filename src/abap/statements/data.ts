import {Statement} from "./_statement";
import {str, seq, IRunnable} from "../combi";
import {DataDefinition} from "../expressions";

export class Data extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("DATA"), new DataDefinition());
  }

}