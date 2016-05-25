import { Rule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";
import * as Statements from "../statements/";

export class StartAtTabConf {
  public enabled: boolean = true;
}

export class StartAtTab implements Rule {

  private conf = new StartAtTabConf();

  public get_key(): string {
    return "start_at_tab";
  }

  public get_description(): string {
    return "Start statement at tab position";
  }

  public get_config() {
    return this.conf;
  }

  public set_config(conf) {
    this.conf = conf;
  }

  public run(file: File) {
    let previous: Position = undefined;

    for (let statement of file.getStatements()) {
      if (statement instanceof Statements.Comment) {
        continue;
      }

      let pos = statement.getStart();
      if (previous !== undefined && pos.getRow() === previous.getRow()) {
        continue;
      }
      if ((pos.getCol() - 1) % 2 !== 0) {
        let issue = new Issue(this, pos, file);
        file.add(issue);
      }
      previous = pos;
    }
  }

}