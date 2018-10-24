type Constructor<T = {}> = new (...args: any[]) => T

type Class<T> = Function & { prototype: T }

type ClassInstanceType<T> = T extends new (...args: any[]) => infer R ? R : T extends { prototype: infer R } ? R : any

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

type MergeClassTypes<T extends Array<Class<any>>> = UnionToIntersection<ClassInstanceType<T[number]>>

export default function traits<T extends Array<Class<any>>> (constructors: T): Constructor<MergeClassTypes<T>> {
  const cls = class {
    constructor () {
      constructors.forEach((c: any) => {
        const tmp = Reflect.construct(c, [], new.target)
        let keys: string[] = []
        for (let key of Object.keys(tmp)) {
          const desc = Object.getOwnPropertyDescriptor(tmp, key)
          if (desc !== undefined) {
            Object.defineProperty(this, key, desc)
          }
          keys.push(key)
        }
      })
    }
  }
  constructors.forEach((c: any) => {
    for (let key of Object.keys(c.prototype)) {
      const desc = Object.getOwnPropertyDescriptor(c.prototype, key)
      if (desc !== undefined) {
        Object.defineProperty(cls.prototype, key, desc)
      }
    }
  })
  return cls as any
}
/* End Implementation */
