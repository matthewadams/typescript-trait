import { expect } from 'chai'

describe('subclass factory', () => {
  it('should work', () => {
    interface INameable {
      name?: string
    }

    type Constructable = new (...args: any[]) => any

    // type InferrableConstructable<I> = new (...args: infer A) => infer T ? new (...args: A) => T & I : never

    const name = 'I am a Nameable!'

    function subclassOf<I, C extends Constructable> (superclass: C):
      C extends new (...args: infer A) => infer T
        ? new (...args: A) => T & I
        : never

    function subclassOf<I> (superclass: new (...args: any[]) => any): new (...args: any[]) => I {
      return class extends superclass implements I {
        name?: string = name
      }
    }

    class Foo {
      bar?: string
    }

    const NameableFoo = subclassOf(Foo)
    const nameableFoo = new NameableFoo()
    nameableFoo.bar = 'bar'

    expect(nameableFoo).to.be.instanceOf(Foo)
    expect(nameableFoo.name).to.be.ok
    expect(nameableFoo.name).to.equal(name)
    expect(nameableFoo.bar).to.equal('bar')
    // bonus: expect(nameableFoo).to.be.instanceOf(INameable)
  })
})