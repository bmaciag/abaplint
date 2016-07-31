import * as Combi from "../combi";

let reg = Combi.regex;
let seq = Combi.seq;
let alt = Combi.alt;
let str = Combi.str;
let opt = Combi.opt;
let re = Combi.reuse;
let star = Combi.star;
let plus = Combi.plus;

export default class Reuse {

  public static integer(): Combi.Reuse {
    return re(() => { return seq(opt(reg(/^-$/)), reg(/^\d+$/)); }, "integer");
  }

  public static typename(): Combi.Reuse {
    return re(() => {
      let start = reg(/^(\/\w+\/)?\w+$/);
      let after = star(seq(this.arrow_or_dash(), reg(/^\w+$/)));
      return seq(start, after); },
              "typename");
  }

  public static field_symbol(): Combi.Reuse {
    return re(() => { return reg(/^<\w+>$/); }, "field_symbol");
  }

  public static inline_decl(): Combi.Reuse {
    return re(() => {
      let data = seq(str("DATA"), str("("), this.field(), str(")"));
      let fs = seq(str("FIELD-SYMBOL"), str("("), this.field_symbol(), str(")"));
      return alt(data, fs); },
              "inline_decl");
  }

  public static target(): Combi.Reuse {
    return re(() => {
      let after = seq(alt(this.field(), this.field_symbol()),
                      star(seq(this.arrow_or_dash(), this.field())));
      let tableBody = seq(str("["), str("]"));
      return alt(this.inline_decl(), seq(after, opt(alt(tableBody, this.field_offset())))); },
              "target");
  }

  public static arrow(): Combi.Reuse {
    return re(() => { return reg(/^(->|=>)$/); }, "arrow");
  }

  public static arrow_or_dash(): Combi.Reuse {
    return re(() => { return reg(/^(->|=>|-)$/); }, "arrow_or_dash");
  }

  public static parameter_s(): Combi.Reuse {
    return re(() => { return seq(this.field(), str("="), this.source()); }, "parameter_s");
  }

  public static parameter_t(): Combi.Reuse {
    return re(() => { return seq(this.field(), str("="), this.target()); }, "parameter_t");
  }

  public static parameter_list_s(): Combi.Reuse {
    return re(() => { return plus(this.parameter_s()); }, "parameter_list_s");
  }

  public static parameter_list_t(): Combi.Reuse {
    return re(() => { return plus(this.parameter_t()); }, "parameter_list_t");
  }

  public static parameter_exception(): Combi.Reuse {
    return re(() => { return seq(this.field(), str("="), this.integer()); }, "parameter_exception");
  }

  public static parameter_list_exceptions(): Combi.Reuse {
    return re(() => { return plus(this.parameter_exception()); }, "parameter_list_exceptions");
  }

  public static field_or_method_call(): Combi.Reuse {
    return re(() => { return alt(this.field_chain(), this.method_call_chain()); }, "field_or_method_call");
  }

  public static compare(): Combi.Reuse {
    let operator = seq(opt(str("NOT")),
                       alt(str("="),
                           str("<>"),
                           str("<"),
                           str(">"),
                           str("<="),
                           str(">="),
                           str("CA"),
                           str("CO"),
                           str("IN"),
                           str("CP"),
                           str("EQ"),
                           str("NE"),
                           str("CN"),
                           str("GE"),
                           str("GT"),
                           str("LT"),
                           str("LE"),
                           str("CS"),
                           str("NP")));

    let sopt = seq(str("IS"),
                   opt(str("NOT")),
                   alt(str("SUPPLIED"),
                       str("BOUND"),
                       str("REQUESTED"),
                       str("ASSIGNED"),
                       str("INITIAL")));

    let between = seq(str("BETWEEN"), Reuse.source(), str("AND"), Reuse.source());

    let ret = seq(opt(str("NOT")),
                  this.source(),
                  alt(seq(operator, this.source()),
                      between,
                      sopt));

    return re(() => { return ret; }, "compare");
  }

  public static cond(): Combi.Reuse {
    let matcher = () => {
      let operator = alt(str("AND"), str("OR"));
      let cnd = alt(this.compare(), seq(opt(str("NOT")), str("("), this.cond(), str(")")));
      let ret = seq(cnd, star(seq(operator, cnd)));

      return ret; };

    return re(matcher, "cond");
  }

  public static function_parameters(): Combi.Reuse {
    let exporting = seq(str("EXPORTING"), this.parameter_list_s());
    let importing = seq(str("IMPORTING"), this.parameter_list_t());
    let changing = seq(str("CHANGING"), this.parameter_list_t());
    let tables = seq(str("TABLES"), this.parameter_list_t());
    let exceptions = seq(str("EXCEPTIONS"), this.parameter_list_exceptions());
    let long = seq(opt(exporting),
                   opt(importing),
                   opt(tables),
                   opt(changing),
                   opt(exceptions));

    return re(() => { return long; }, "function_parameters");
  }

  public static method_parameters(): Combi.Reuse {
    let exporting = seq(str("EXPORTING"), this.parameter_list_s());
    let importing = seq(str("IMPORTING"), this.parameter_list_t());
    let changing = seq(str("CHANGING"), this.parameter_list_t());
    let receiving = seq(str("RECEIVING"), this.parameter_t());
    let exceptions = seq(str("EXCEPTIONS"), this.parameter_list_exceptions());
    let long = seq(opt(exporting),
                   opt(importing),
                   opt(changing),
                   opt(receiving),
                   opt(exceptions));

    return re(() => { return long; }, "method_parameters");
  }

  public static method_call_chain(): Combi.Reuse {
    let after = star(seq(this.arrow_or_dash(), this.method_call()));

    let ret = seq(opt(seq(this.field_chain(), this.arrow())), this.method_call(), after);

    return re(() => { return ret; }, "method_call_chain");
  }

  public static field_offset(): Combi.Reuse {
    let offset = seq(str("+"), reg(/^[\d\w]+$/), opt(seq(this.arrow_or_dash(), this.field())));

    return re(() => { return offset; }, "field_offset");
  }

  public static field_length(): Combi.Reuse {
    let length = seq(str("("), reg(/^[\d\w]+$/), opt(seq(this.arrow_or_dash(), this.field())), str(")"));

    return re(() => { return length; }, "field_length");
  }

  public static field_chain(): Combi.Reuse {
    let ret = seq(alt(this.field(), this.field_symbol()), star(seq(this.arrow_or_dash(), this.field())));

    return re(() => { return seq(ret, opt(this.field_offset()), opt(this.field_length())); }, "field_chain");
  }

  public static method_name(): Combi.Reuse {
    return re(() => { return reg(/^\w+(~\w+)?$/); }, "method_name");
  }

  public static method_call(): Combi.Reuse {
    let ret = seq(this.method_name(), str("("),
                  alt(this.source(), this.parameter_list_s(), Reuse.method_parameters()), str(")"));

    return re(() => { return ret; }, "method_call");
  }

  public static string_template(): Combi.Reuse {
    return re(() => { return reg(/^\|(.|\n)*\|$/); }, "string_template");
  }

  public static arith_operator(): Combi.Reuse {
    let ret = alt(str("+"),
                  str("-"),
                  str("*"),
                  str("/"),
                  str("MOD"));

    return re(() => { return ret; }, "arith_operator");
  }

  public static source(): Combi.Reuse {
    let matcher = () => {
      let single = alt(seq(this.method_call_chain(), opt(seq(this.arrow_or_dash(), this.field_chain()))),
                       this.field_chain());

      let paren = seq(str("("), this.source(), str(")"));

      let after = seq(alt(str("&&"), this.arith_operator()), this.source());
      let ref = seq(this.arrow(), str("*"));

      let ret = seq(alt(this.constant(), this.string_template(), single, paren),
                    opt(alt(ref, after)));

      let tableBody = seq(str("["), str("]"));

      return seq(ret, opt(tableBody)); };

    return re(matcher, "source");
  }

  public static field_sub(): Combi.Reuse {
    return re(() => { return seq(reg(/^\w+$/), star(seq(reg(/^-$/), reg(/^\w+$/)))); }, "field_sub");
  }

  public static field(): Combi.Reuse {
// "&1" can be used for almost anything(field names, method names etc.) in macros
    return re(() => { return reg(/^&?\w+(~\w+)?$/); }, "field");
  }

  public static constant(): Combi.Reuse {
    return re(() => {
      let stri = seq(reg(/^('.*')|(`.*`)$/), opt(seq(str("("), reg(/^\d\d\d$/), str(")"))));
      return alt(stri, this.integer()); },
              "constant");
  }
}