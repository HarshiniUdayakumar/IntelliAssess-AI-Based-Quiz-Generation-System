export const courses = [
  { id: "c1", name: "Mathematics" },
  { id: "c2", name: "Physics" }
];

export const units = [
  { id: "u1", courseId: "c1", name: "Algebra" },
  { id: "u2", courseId: "c1", name: "Trigonometry" },
  { id: "u3", courseId: "c2", name: "Mechanics" }
];

export const modules = [
  { id: "m1", unitId: "u1", name: "Linear Equations" },
  { id: "m2", unitId: "u1", name: "Quadratic Equations" },
  { id: "m3", unitId: "u2", name: "Sine & Cosine Rules" },
  { id: "m4", unitId: "u3", name: "Newton Laws" }
];