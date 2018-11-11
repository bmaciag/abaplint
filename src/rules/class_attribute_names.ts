import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Class} from "../objects";
import {Registry} from "../registry";
import {ClassAttributes} from "../abap/types/class_attributes";
import {ClassAttribute} from "../abap/types/class_attribute";

export class ClassAttributeNamesConf {
  public enabled: boolean = true;
  public ignoreExceptions: boolean = true;
  public statics: string = "^G._.*$";
  public instance: string = "^M._.*$";
}

export class ClassAttributeNames implements IRule {

  private conf = new ClassAttributeNamesConf();

  public getKey(): string {
    return "class_attribute_names";
  }

  public getDescription(): string {
    return "Class Attribute Names";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ClassAttributeNamesConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: Registry): Issue[] {
    let attr: ClassAttributes = undefined;

// todo, consider local classes(PROG, FUGR, CLAS)

    if (obj instanceof Class) {
      if (this.conf.ignoreExceptions && obj.isException()) {
        return [];
      }
      if (obj.getAttributes() === undefined) {
        return [];
      }
      attr = obj.getAttributes();
// todo, INTF
//    } else if (obj instanceof Interface) {
//      methods = obj();
    }


    return this.checkAttributes(attr, obj);
  }

  private checkAttributes(attr: ClassAttributes, obj: IObject): Issue[] {
    if (!attr) { return []; }
    let ret: Issue[] = [];

    for (let ins of attr.getInstance()) {
      ret = ret.concat(this.checkName(ins, this.conf.instance, obj));
    }

    for (let sta of attr.getStatic()) {
      ret = ret.concat(this.checkName(sta, this.conf.statics, obj));
    }

    return ret;
  }

  private checkName(attr: ClassAttribute, expected: string, obj: IObject): Issue[] {
    let ret: Issue[] = [];
    let regex = new RegExp(expected, "i");
    let name = attr.getName();

    if (regex.test(name) === false) {
      const message = "Bad attribute name \"" + name + "\" expected \"" + expected + "/i\"";
// todo, find the right file
      let issue = new Issue({file: obj.getFiles()[0], message, code: this.getKey(), start: attr.getPosition()});
      ret.push(issue);
    }

    return ret;
  }

}