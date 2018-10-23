type Constructor<T = {}> = new (...args: any[]) => T
type Class<T> = Function & { prototype: T }

type ClassInstanceType<T> = T extends new (...args: any[]) => infer R
  ? R
  : T extends { prototype: infer R } ? R : any;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never
type MergeClassTypes<T extends Array<Class<any>>> = UnionToIntersection<ClassInstanceType<T[number]>>

export default function traits<T extends Array<Class<any>>> (constructors: T): Constructor<MergeClassTypes<T>> {
  const cls = class {
    state = {}

    constructor () {
      constructors.forEach((c: any) => {
        c.apply(this)
      })
    }
  }
  constructors.forEach((c: any) => {
    Object.assign(cls.prototype, c.prototype)
  })
  return cls as any
}
/* End Implementation */
