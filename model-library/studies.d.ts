/** Layout data only. Host applications own assets, credits and access decisions. */
export interface CompositeStudyDefinition {
  key: string;
  name: string;
  renderer_target: string;
  preparation: string;
  instancing?: boolean;
  camera?: { eye: [number, number, number]; target: [number, number, number]; fov: number };
  /** Source key, bottom-centre anchor, longest dimension in scene units, Y rotation in radians. */
  placements: [string, [number, number, number], number, number][];
}
export function compositeStudyDefinitions(): CompositeStudyDefinition[];

export function denseStudyDefinitions(): CompositeStudyDefinition[];
