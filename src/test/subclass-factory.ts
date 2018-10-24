import { expect } from 'chai'

describe('subclass factory', () => {
  it('should work', () => {
    const name = 'I am a Nameable!'

    interface INameable {
      name?: string
    }

    type Constructable = new (...args: any[]) => any

    function nameableSubclassOf<C extends Constructable> (superclass: C):
      C extends new (...args: infer A) => infer T
        ? new (...args: A) => T & INameable
        : never

    function nameableSubclassOf (superclass: Constructable): new (...args: any[]) => INameable {
      return class extends superclass implements INameable {
        name?: string = name
      }
    }

    class Foo {
      bar?: string
    }

    const NameableFoo = nameableSubclassOf(Foo)
    const nameableFoo = new NameableFoo()
    nameableFoo.bar = 'bar'

    expect(nameableFoo).to.be.instanceOf(Foo)
    expect(nameableFoo.name).to.be.ok
    expect(nameableFoo.name).to.equal(name)
    expect(nameableFoo.bar).to.equal('bar')
    // expect(nameableFoo).to.be.instanceOf(INameable)
  })
})
