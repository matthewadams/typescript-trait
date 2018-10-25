import { expect } from 'chai'

import { Trait, superclass, trait, traits } from 'mutrait'

describe('traits', () => {
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
      class extends superclass(s).expressing(Supertrait1, Supertrait2) {
        bar () { return 'bar from Subtrait' }
        snafu () { return 'snafu from Subtrait' }
      })

    class C extends trait(Subtrait) {
      snafu () { return 'snafu from C' }
    }

    const c = new C()
    expect(c.bleep()).to.equal('bleep from Supertrait1')
    expect(c.foo()).to.equal('foo from Supertrait2')
    expect(c.bar()).to.equal('bar from Subtrait')
    expect(c.snafu()).to.equal('snafu from C')
    expect(c instanceof C).to.be.true
    expect(c instanceof Subtrait).to.be.true
    expect(c instanceof Supertrait2).to.be.true
    expect(c instanceof Supertrait1).to.be.true
  })
})
