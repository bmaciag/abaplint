import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Class} from "../../src/objects";
import {Scope} from "../../src/abap/types/scope";

describe("Objects, class, isException", () => {

  it("false, parser error", () => {
    const reg = new Registry().addFile(new MemoryFile("cl_foo.clas.abap", "WRITE foo.")).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getMainClass()).to.equal(undefined);
  });

  it("false", () => {
    const abap = "CLASS zcl_abapgit_moo DEFINITION PUBLIC\n" +
      "FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_abapgit_moo IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_abapgit_moo.clas.abap", abap)).parse();
    expect(reg.findIssues().length).to.equal(0);
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.isException()).to.equal(false);
  });

  it("true", () => {
    const abap = "CLASS zcx_abapgit_cancel DEFINITION PUBLIC\n" +
      "INHERITING FROM cx_static_check FINAL CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcx_abapgit_cancel IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcx_foo.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.isException()).to.equal(true);
  });

  it("not parsed", () => {
    const reg = new Registry().addFile(new MemoryFile("zcx_foo.clas.abap", "foo bar"));
    const clas = reg.getABAPObjects()[0] as Class;
    expect(() => { clas.isException(); }).to.throw();
  });

});

describe("Objects, class, getName", () => {

  it("test", () => {
    const abap = "class zcl_name definition public create public.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_name IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_name.clas.abap", abap)).parse();
    const obj = reg.getObjects()[0];
    expect(obj.getName()).to.equal("ZCL_NAME");
  });

});

describe("Objects, class, getSuperClass", () => {

  it("test, positive", () => {
    const abap = "class ZCL_WITH_SUPER definition public inheriting from ZCL_SUPER final create public.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_WITH_SUPER IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getSuperClass()).to.equal("ZCL_SUPER");
  });


  it("test, negative", () => {
    const abap = "class ZCL_WITH_SUPER definition public final create public.\n" +
      "ENDCLASS.\n" +
      "CLASS ZCL_WITH_SUPER IMPLEMENTATION.\n" +
      "ENDCLASS.";
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getSuperClass()).to.equal(undefined);
  });

  it("test, parser error", () => {
    const abap = "parser error";
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getSuperClass()).to.equal(undefined);
  });

});

describe("Objects, class, getMethodDefinitions", () => {
  it("test, positive", () => {
    const abap = "CLASS zcl_with_super DEFINITION PUBLIC CREATE PUBLIC.\n" +
    "  PUBLIC SECTION.\n" +
    "  PROTECTED SECTION.\n" +
    "  PRIVATE SECTION.\n" +
    "    METHODS method1.\n" +
    "ENDCLASS.\n" +
    "CLASS ZCL_WITH_SUPER IMPLEMENTATION.\n" +
    "  METHOD method1.\n" +
    "  ENDMETHOD.\n" +
    "ENDCLASS.";

    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getMethodDefinitions()).to.not.equal(undefined);
    const methods = clas.getMethodDefinitions();
    if (methods !== undefined) {
      expect(methods.getPrivate().length).to.equal(1);
      expect(methods.getPrivate()[0].getName()).to.equal("method1");
      expect(methods.getPrivate()[0].getScope()).to.equal(Scope.Private);
    }
  });

  it("test, parser error", () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_with_super.clas.abap", "parser error")).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getMethodDefinitions()).to.equal(undefined);
  });

});

describe("Objects, class, getAttributes", () => {

  it("test, positive, instance", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.\n" +
    "  PUBLIC SECTION.\n" +
    "  PROTECTED SECTION.\n" +
    "  PRIVATE SECTION.\n" +
    "    DATA moo TYPE i.\n" +
    "ENDCLASS.\n" +
    "CLASS zcl_foobar IMPLEMENTATION.\n" +
    "ENDCLASS.";

    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getAttributes()).to.not.equal(undefined);
    const attr = clas.getAttributes();
    if (attr !== undefined) {
      expect(attr.getInstance().length).to.equal(1);
      expect(attr.getInstance()[0].getName()).to.equal("moo");
      expect(attr.getInstance()[0].getScope()).to.equal(Scope.Private);
      expect(attr.getStatic().length).to.equal(0);
    }
  });

  it("test, positive, static", () => {
    const abap = "CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.\n" +
    "  PUBLIC SECTION.\n" +
    "  PROTECTED SECTION.\n" +
    "  PRIVATE SECTION.\n" +
    "    CLASS-DATA moo TYPE i.\n" +
    "ENDCLASS.\n" +
    "CLASS zcl_foobar IMPLEMENTATION.\n" +
    "ENDCLASS.";

    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap)).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getAttributes()).to.not.equal(undefined);
    const attr = clas.getAttributes();
    if (attr !== undefined) {
      expect(attr.getStatic().length).to.equal(1);
      expect(attr.getStatic().length).to.equal(1);
      expect(attr.getStatic()[0].getName()).to.equal("moo");
      expect(attr.getStatic()[0].getScope()).to.equal(Scope.Private);
      expect(attr.getInstance().length).to.equal(0);
    }
  });

// todo, one test for each section, plus data/static/constant

  it("test, parser error", () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", "parser error")).parse();
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.getAttributes()).to.equal(undefined);
  });

});