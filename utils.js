import { Vector3, MathUtils } from "three";

export const getObjectScaleVector = () => {
  const x = MathUtils.randFloat(0.2, 3);
  const y = MathUtils.randFloat(0.2, 3);
  const z = MathUtils.randFloat(0.2, 3);

  return new Vector3(x, y, z);
};
