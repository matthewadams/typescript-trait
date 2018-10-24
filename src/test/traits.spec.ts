import { expect } from 'chai'

import { Constructor, Class, Trait, superclass } from '../main/trait'

describe('traits', () => {
  it('should work', () => {
    interface INameable {
      name?: string
    }

    const Nameable = <S>(superclass: Constructor<S>) => class extends superclass implements INameable {
      name?: string
    }

    class Person extends superclass().expressing(Nameable) {
      dob?: Date
    }

    const person = new Person()
    person.name = 'Bob'

    expect(person.name).to.equal('Bob')
  })

  // it('multiple supertraits with correct overrides', () => {
  //   class /* trait */ Supertrait1 {
  //     bleep () { return 'bleep from Supertrait1' }
  //     foo () { return 'foo from Supertrait1' }
  //     bar () { return 'bar from Supertrait1' }
  //     snafu () { return 'snafu from Supertrait1' }
  //     get blargy () { return 'blargy from Supertrait1' }
  //   }
  //
  //   class /* trait */ Supertrait2 extends Supertrait1 {
  //     foo () { return 'foo from Supertrait2' }
  //     bar () { return 'bar from Supertrait2' }
  //     snafu () { return 'snafu from Supertrait2' }
  //   }
  //
  //   class /* trait */ Subtrait extends Supertrait2 {
  //     bar () { return 'bar from Subtrait' }
  //     snafu () { return 'snafu from Subtrait' }
  //   }
  //
  //   abstract class /* trait */ AnotherTrait {
  //     _more: string = 'more from AnotherTrait'
  //     get blargy () { return 'blargy from AnotherTrait' }
  //     get another () { return 'another from AnotherTrait' }
  //     get more () { return this._more }
  //     set more (value: string) {
  //       this._more = this.checkMore(value)
  //     }
  //     abstract checkMore (value: string): string
  //   }
  //
  //   class C extends traits([Subtrait, AnotherTrait]) /* expresses Subtrait, AnotherTrait */ {
  //     snafu () { return 'snafu from C' }
  //     get another () { return 'another from C' }
  //     checkMore (value: string): string {
  //       if (!value) throw new Error('no more given')
  //       return value
  //     }
  //   }
  //
  //   const c = new C()
  //
  //   expect(c.bleep()).to.equal('bleep from Supertrait1')
  //   expect(c.foo()).to.equal('foo from Supertrait2')
  //   expect(c.bar()).to.equal('bar from Subtrait')
  //   expect(c.snafu()).to.equal('snafu from C')
  //   expect(c.another).to.equal('another from C')
  //   expect(c.blargy).to.equal('blargy from AnotherTrait')
  //   expect(c.more).to.equal('more from AnotherTrait')
  //   expect(() => {
  //     c.more = ''
  //   }).to.throw()
  //
  //   expect(c).to.be.instanceOf(C)
  //   expect(c).to.be.instanceOf(Subtrait)
  //   expect(c).to.be.instanceOf(Supertrait2)
  //   expect(c).to.be.instanceOf(Supertrait1)
  //   expect(c).to.be.instanceOf(AnotherTrait)
  // })
})
