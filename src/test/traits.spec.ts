import { expect } from 'chai'

import { Trait, superclass } from '../main/trait'

describe('expressionOf', () => {
  it('multiple supertraits with correct overrides', () => {
    const Supertrait1 = Trait(s => class extends s {
      bleep () { return 'bleep from Supertrait1' }
      foo () { return 'foo from Supertrait1' }
      bar () { return 'bar from Supertrait1' }
      snafu () { return 'snafu from Supertrait1' }
    })

    const Supertrait2 = Trait(s => class extends s {
      foo () { return 'foo from Supertrait2' }
      bar () { return 'bar from Supertrait2' }
      snafu () { return 'snafu from Supertrait2' }
    })

    const Subtrait = Trait(s =>
      class extends superclass(s).expressing(Supertrait1).expressing(Supertrait2).express() {
        bar () { return 'bar from Subtrait' }
        snafu () { return 'snafu from Subtrait' }
      })

    const AnotherTrait = Trait(s => class extends s {
      another () { return 'another from AnotherTrait' }
      more () { return 'more from AnotherTrait' }
    })

    class B {
      bloop () { return 'bloop from B' }
      blargy () { return 'blargy from B ' }
    }

    class C extends superclass(B).expressing(Subtrait).expressing(AnotherTrait).express() {
      snafu () { return 'snafu from C' }
      more () { return 'more from C' }
      bloop () { return 'bloop from C' }
    }

    const c = new C()
    expect(c.bleep()).to.equal('bleep from Supertrait1')
    expect(c.foo()).to.equal('foo from Supertrait2')
    expect(c.bar()).to.equal('bar from Subtrait')
    expect(c.snafu()).to.equal('snafu from C')
    expect(c.more()).to.equal('more from C')
    expect(c.bloop()).to.equal('bloop from C')
    expect(c instanceof C).to.be.true
    expect(c instanceof B).to.be.true
    expect(c instanceof Subtrait).to.be.true
    expect(c instanceof Supertrait2).to.be.true
    expect(c instanceof Supertrait1).to.be.true
    expect(c instanceof AnotherTrait).to.be.true
  })
})
