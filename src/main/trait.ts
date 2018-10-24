// type ClassInstanceType<T> = T extends new (...args: any[]) => infer R ? R : T extends { prototype: infer R } ? R : any
//
// type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never
//
// type MergeClassTypes<T extends Array<Class<any>>> = UnionToIntersection<ClassInstanceType<T[number]>>

export interface Constructable<T> extends Function {
  new (...args: any[]): T
}

export type Class<T> = Function & { prototype: T }

export type Trait<I,S = {}> = (superclass?: Constructable<S>) => Class<I & S>

export const superclass = <S = any>(s?: Constructable<S>) => new TraitBuilder(s)

export class TraitBuilder<S = any> {
  superclass: Constructable<S>

  constructor (superclass?: Constructable<S>) {
    this.superclass = superclass || (class {} as any)
  }

  expressing <T> (t: Trait<T,S>): Class<T & S> {
    return t(this.superclass)
  }
}
