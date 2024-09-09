import { register } from "node:module";
import { pathToFileURL } from "node:url";
import Jasmine from "jasmine";
import path from "node:path";

register("ts-node/esm", pathToFileURL("./"));

const jasmine = new Jasmine();
const configPath = path.resolve("./src/test/jasmine.json");

jasmine.loadConfigFile(configPath);
jasmine.execute();
