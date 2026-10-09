import { expect, it } from "vitest";
import gsap from "gsap";
import { Physics2DPlugin } from "./physics";
gsap.registerPlugin(Physics2DPlugin);
it("Physics2D supports a paused authored ballistic spark under backward/direct seeking", () => {
  const make = () => {
    const spark = { x: 0, y: 0 };
    const timeline = gsap
      .timeline({ paused: true })
      .set(spark, { x: 0, y: 0 }, 0)
      .to(
        spark,
        { duration: 3, physics2D: { velocity: 280, angle: -55, gravity: 180 }, ease: "none" },
        0,
      );
    return { spark, timeline };
  };
  const a = make(),
    b = make();
  a.timeline.seek(1.7);
  const expected = { ...a.spark };
  a.timeline.seek(2.8).seek(0.2).seek(1.7);
  b.timeline.seek(1.7);
  expect(a.spark.x).toBeCloseTo(expected.x, 8);
  expect(a.spark.y).toBeCloseTo(expected.y, 8);
  expect(b.spark.x).toBeCloseTo(expected.x, 8);
  expect(b.spark.y).toBeCloseTo(expected.y, 8);
  a.timeline.kill();
  b.timeline.kill();
});
