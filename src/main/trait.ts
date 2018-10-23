/* implementation */
type Constructor<T = {}> = new (...args: any[]) => T

/* turns A | B | C into A & B & C */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

/* merges constructor types - self explanitory */
type MergeConstructorTypes<T extends Array<Constructor<any>>> = UnionToIntersection<InstanceType<T[number]>>

export default function traits<T extends Array<Constructor<any>>> (constructors: T): Constructor<MergeConstructorTypes<T>> {
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
