import { createChoreography, type DirectorContext } from "../../../motion/gsap/createChoreography";

export function choreography(context: DirectorContext) {
  return createChoreography(context, "ember");
}
