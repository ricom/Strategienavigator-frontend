/**
 * This module was automatically generated by `ts-interface-builder`
 */
import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const UtilResultValues = t.iface([], {
  "percentages": t.array(t.iface([], {
    "criteria": "CardComponentField",
    "points": "number",
    "percentage": "number",
  })),
  "result": t.array(t.iface([], {
    "object": "CardComponentField",
    "points": "number",
    "rank": "number",
  })),
});

const UtilResultComponent_ts: t.ITypeSuite = {
  UtilResultValues,
};
export default UtilResultComponent_ts;
