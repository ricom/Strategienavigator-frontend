/**
 * This module was automatically generated by `ts-interface-builder`
 */
import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const UtilEvaluationValues = t.iface([], {
  "evaluation": t.array(t.iface([], {
    "criteriaIndex": "number",
    "objects": t.array("number"),
    "rating": "CompareComponentValues",
  })),
});

export const UtilEvaluationComponentState = t.iface([], {
  "showModal": "number",
});

const UtilEvaluationComponent_ts: t.ITypeSuite = {
  UtilEvaluationValues,
  UtilEvaluationComponentState,
};
export default UtilEvaluationComponent_ts;
