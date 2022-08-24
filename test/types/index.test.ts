import { expectAssignable, expectType } from "tsd";
import ValidatorSelector, { ValidatorCompiler, StandaloneValidator, RouteDefinition } from "../..";

const compiler = ValidatorSelector();
expectType<ValidatorCompiler>(compiler);

const reader = StandaloneValidator({
  readMode: true,
  restoreFunction: (route: RouteDefinition) => {
    expectAssignable<RouteDefinition>(route)
  },
});
expectType<ValidatorCompiler>(reader);

const writer = StandaloneValidator({
  readMode: false,
  storeFunction: (route: RouteDefinition, code: string) => {
    expectAssignable<RouteDefinition>(route)
    expectAssignable<string>(code)
  },
});
expectType<ValidatorCompiler>(writer);
