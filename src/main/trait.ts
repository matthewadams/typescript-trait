const _appliedTrait = Symbol('_appliedTrait')

// used by wrap() and unwrap()
const _wrappedTrait = Symbol('_wrappedTrait')

const _cachedApplications = Symbol('_cachedApplications')

type Constructor<T> = {
  // 'new' can be called on a constructor to produce a T.
  new(...args: any[]): T;

  [_cachedApplications]: Map<TraitFunction<any, any>, Constructor<any>>;
}

/**
 * A function that returns an empty or non-empty subclass of its argument.
 *
 * @example
 * const T = (superclass) => class extends superclass {
 *   getMessage() {
 *     return "Hello";
 *   }
 * }
 *
 * @typedef {Function} TraitFunction
 * @param {Function} superclass If falsey, the superclass is literally `class {}`
 * @return {Function} A subclass of `superclass`
 */

type TraitFunction<A, B extends A> = {
  // trait functions are callable and map from one class to a subclass of it.
  (a: Constructor<A>): Constructor<B>;

  // Trait functions can wrap another TraitFunction
  [_wrappedTrait]?: TraitFunction<A, B>;
}

type WrappedTraitFunction<A, B extends A, C, D extends C> = TraitFunction<A, B> & { [_wrappedTrait]: TraitFunction<C, D> }

/**
 * Applies `trait` to `superclass`.
 *
 * `apply` stores a reference from the trait application to the unwrapped trait
 * to make `isTraitificationOf` and `expresses` work.
 *
 * This function is useful for trait wrappers that want to automatically enable
 * {@link expresses} support.
 *
 * @example
 * const Applier = trait => wrap(trait, superclass => apply(superclass, trait));
 *
 * // T now works expressing `expresses` and `isTraitificationOf`
 * const T = Applier(superclass => class extends superclass {});
 *
 * class C extends T(class {}) {}
 * let i = new C();
 * expresses(i, T); // true
 *
 * @function
 * @param {Function} superclass A class or constructor function or a falsey value
 * @param {TraitFunction} trait The trait to apply
 * @return {Function} A subclass of `superclass` produced by `trait`
 */
export const apply = <T, U extends T>(superclass: Constructor<T>, trait: TraitFunction<T, U>): Constructor<U> => {
  let application = trait(superclass)
  application.prototype[_appliedTrait] = unwrap(trait)
  return application
}

/**
 * Returns `true` iff `proto` is a prototype created by the application of
 * `trait` to a superclass.
 *
 * `isTraitificationOf` works by checking that `proto` has a reference to `trait`
 * as created by `apply`.
 *
 * @function
 * @param {Object} proto A prototype object created by {@link apply}.
 * @param {TraitFunction} trait A trait function used expressing {@link apply}.
 * @return {boolean} whether `proto` is a prototype created by the application of
 * `trait` to a superclass
 */
export const isTraitificationOf = <T, U extends T>(proto: any, trait: TraitFunction<T, U>) =>
  proto.hasOwnProperty(_appliedTrait) && proto[_appliedTrait] === unwrap(trait)

/**
 * Returns `true` iff `o` has an application of `trait` on its prototype
 * chain.
 *
 * @function
 * @param {Object} it An object
 * @param {TraitFunction} trait A trait applied expressing {@link apply}
 * @return {boolean} whether `o` has an application of `trait` on its prototype
 * chain
 */
export const expresses = <T, U extends T>(it: Object, trait: TraitFunction<T, U>) => {
  while (it != null) {
    if (isTraitificationOf(it, trait)) return true
    it = Object.getPrototypeOf(it)
  }
  return false
}

/**
 * Sets up the function `trait` to be wrapped by the function `wrapper`, while
 * allowing properties on `trait` to be available via `wrapper`, and allowing
 * `wrapper` to be unwrapped to get to the original function.
 *
 * `wrap` does two things:
 *   1. Sets the prototype of `trait` to `wrapper` so that properties set on
 *      `trait` inherited by `wrapper`.
 *   2. Sets a special property on `trait` that points back to `trait` so that
 *      it can be retreived from `wrapper`
 *
 * @function
 * @param {TraitFunction} trait A trait function
 * @param {TraitFunction} wrapper A function that wraps {@link trait}
 * @return {TraitFunction} `wrapper`
 */
export const wrap = <A, B extends A>(trait: TraitFunction<A, B>, wrapper: TraitFunction<A, B>):
  TraitFunction<A, B> => {
  Object.setPrototypeOf(wrapper, trait)
  if (!trait[_wrappedTrait]) {
    trait[_wrappedTrait] = trait
  }
  return wrapper
}

/**
 * Unwraps the function `wrapper` to return the original function wrapped by
 * one or more calls to `wrap`. Returns `wrapper` if it's not a wrapped
 * function.
 *
 * @function
 * @param {TraitFunction} wrapper A wrapped trait produced by {@link wrap}
 * @return {TraitFunction} The originally wrapped trait
 */
export function unwrap<TWrapper extends TraitFunction<any, any>> (wrapper: TWrapper):
  TWrapper extends WrappedTraitFunction<infer A, infer B, infer C, infer D>
    ? TraitFunction<C, D>
    : TWrapper extends TraitFunction<infer A, infer B>
    ? TraitFunction<A, B>
    : never {
  return wrapper[_wrappedTrait] as any || wrapper
}

/**
 * Decorates `trait` so that it caches its applications. When applied multiple
 * times to the same superclass, `trait` will only create one subclass, memoize
 * it and return it for each application.
 *
 * Note: If `trait` somehow stores properties in its class's constructor (static
 * properties), or on its class's prototype, it will be shared across all
 * applications of `trait` to a superclass. It's recommended that `trait` only
 * access instance state.
 *
 * @function
 * @param {TraitFunction} trait The trait to wrap expressing caching behavior
 * @return {TraitFunction} a new trait function
 */
export const Cached = <A, B extends A>(trait: TraitFunction<A, B>) => wrap(trait, superclass => {
  // Get or create a symbol used to look up a previous application of trait
  // to the class. This symbol is unique per trait definition, so a class will have N
  // applicationRefs if it has had N traits applied to it. A trait will have
  // exactly one _cachedApplicationRef used to store its applications.

  let cachedApplications = superclass[_cachedApplications]
  if (!cachedApplications) {
    cachedApplications = superclass[_cachedApplications] = new Map()
  }

  let application: Constructor<B> | undefined = cachedApplications.get(trait)
  if (!application) {
    application = trait(superclass)
    cachedApplications.set(trait, application)
  }

  return application
})

/**
 * Decorates `trait` so that it only applies if it's not already on the
 * prototype chain.
 *
 * @function
 * @param {TraitFunction} trait The trait to wrap expressing deduplication behavior
 * @return {TraitFunction} a new trait function
 */
export const Dedupe = <A, B extends A>(trait: TraitFunction<A, B>) =>
  wrap(trait, superclass => expresses(superclass.prototype, trait) ? superclass : trait(superclass))

/**
 * Adds [Symbol.hasInstance] (ES2015 custom instanceof support) to `trait`.
 * If the trait already has a [Symbol.hasInstance] property, then that is called firstName.
 * If it return a truey value, then that truey value is returned, else the return value of {@link expresses} is returned.
 *
 * @function
 * @param {TraitFunction} trait The trait to add [Symbol.hasInstance] to
 * @return {TraitFunction} the given trait function
 */
export const HasInstance = <A, B extends A>(trait: TraitFunction<A, B>) => {
  if (Symbol && Symbol.hasInstance) {
    const priorHasInstance = trait[Symbol.hasInstance]
    Object.defineProperty(trait, Symbol.hasInstance, {
      value (it: any) {
        return priorHasInstance(it) || expresses(it, trait)
      }
    })
  }
  return trait
}

/**
 * A basic trait decorator that applies the trait expressing {@link apply} so that it
 * can be used expressing {@link isTraitificationOf}, {@link expresses} and the other
 * trait decorator functions.
 *
 * @function
 * @param {TraitFunction} trait The trait to wrap
 * @return {TraitFunction} a new trait function
 */
export const BareTrait = <A, B extends A>(trait: TraitFunction<A, B>) =>
  wrap(trait, superclass => apply(superclass, trait))

/**
 * Decorates a trait function to add deduplication, application caching and
 * instanceof support.
 *
 * @function
 * @param {TraitFunction} trait The trait to wrap
 * @return {TraitFunction} a new trait function
 */
export const Trait = <A, B extends A>(trait: TraitFunction<A, B>) => HasInstance(Dedupe(Cached(BareTrait(trait))))

/**
 * A fluent interface to apply a list of traits to a superclass.
 *
 * ```javascript
 * class X extends superclass(Superclass).expressing(A, B, C) {}
 * ```
 *
 * The traits are applied in order to the superclass, so the prototype chain
 * will be: X->C'->B'->A'->Superclass.
 *
 * This is purely a convenience function. The above example is equivalent to:
 *
 * ```javascript
 * class X extends C(B(A(Superclass || class {}))) {}
 * ```
 *
 * @function
 * @param {Function} [superclass=(class {})]
 * @return {TraitBuilder}
 */
export const superclass = (superclass?: Function) => new TraitBuilder(superclass)

/**
 * A convenient syntactical shortcut to handle the case when a class extends
 * no other class, instead of having to call
 * ```javascript
 * superclass().expressing(M1).express()
 * ```
 * which avoids confusion over whether someone should or shouldn't pass a
 * superclass argument and so that it reads more naturally.
 *
 * @param ts {TraitFunction} the trait that should be expressed
 * @returns {Function}
 */
export const trait = <A, B extends A>(t: TraitFunction<A,B>) => superclass().expressing(t).express()

export class TraitBuilder {
  private cls: Function

  constructor (superclass?: Function) {
    this.cls = superclass || class {}
  }

  expressing <A, B extends A> (trait: TraitFunction<A,B>) {
    this.cls = trait(this.cls as Constructor<A>)
    return this
  }

  express () {
    return this.cls
  }
}
