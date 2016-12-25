import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let opt = Combi.opt;
let seq = Combi.seq;
let alt = Combi.alt;
let plus = Combi.plus;

export class Concatenate extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let mode = seq(str("IN"),
                   alt(str("BYTE"), str("CHARACTER")),
                   str("MODE"));

    return seq(str("CONCATENATE"),
               new Reuse.Source(),
               plus(new Reuse.Source()),
               str("INTO"),
               new Reuse.Target(),
               opt(mode),
               opt(str("RESPECTING BLANKS")),
               opt(seq(str("SEPARATED BY"), new Reuse.Source())));
  }

}