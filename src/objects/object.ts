import {File} from "../file";

export abstract class Object {
  protected files: File[];
  private name: string;
  private package: string;

  public abstract getType(): string;

  public constructor(name: string, devPackage: string) {
    this.name = name;
    this.package = devPackage;
    this.files = [];
  }

  public getName(): string {
    return this.name;
  }

  public getPackage() {
    return this.package;
  }

  public addFile(file: File) {
    this.files.push(file);
  }

}