// type ClassInstanceType<T> = T extends new (...args: any[]) => infer R ? R : T extends { prototype: infer R } ? R : any
//
// type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never
//
// type MergeClassTypes<T extends Array<Class<any>>> = UnionToIntersection<ClassInstanceType<T[number]>>

export type Constructor<T = {}> = new (...args: any[]) => T

export type Class<T> = Function & { prototype: T }

export type Trait<T,SUP = {}> = (superclass?: Constructor<SUP>) => Class<T & SUP>

export const superclass = <S = any>(s?: Constructor<S>) => new TraitBuilder(s)

export class TraitBuilder<S = any> {
  superclass: Constructor<S>

  constructor (superclass?: Constructor<S>) {
    this.superclass = superclass || (class {} as any)
  }

  expressing <T,U> (t: Trait<T,U>): Class<T & U> {
    return t(this.superclass)
  }
}
