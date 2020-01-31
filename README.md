# simple-react-redux
一个简单的 react-redux 实现，供参考学习其原理。
## 原理
如果想要将 Redux 结合 React 使用的话，通常可以使用 react-redux 这个库。
如果你对 Redux 原理比较熟悉的话，相信你也知道 react-redux 是如何实现的了吧。
react-redux 一共提供了两个 API，分别是 connect 和 Provider，前者是一个 React 高阶组件，后者是一个普通的 React 组件。react-redux 实现了一个简单的***发布-订阅***库，来监听当前 store 的变化。
两者的作用如下：
1. Provider：将 store 通过 Context 传给后代组件，注册对 store 的监听。
2. connect：一旦 store 变化就会执行 mapStateToProps 和 mapDispatchToProps 获取最新的 props 后，将其传给子组件。

![image_1dvqrhjgi1n02j9qhrjel9vi61g.png-20kB][5]

使用方式：
```
// Provider
ReactDOM.render({
    <Provider store={store}></Provider>,
    document.getElementById('app')
})
// connect
@connect(mapStateToProps, mapDispatchToProps)
class App extends Component {}
```
### Provider
先来实现简单的 Provider，已知 Provider 会使用 Context 来传递 store，所以 Provider 直接通过 `Context.Provider` 将 store 给子组件。
```
// Context.js
const ReactReduxContext = createContext(null);

// Provider.js
const Provider = ({ store, children }) => {
    return (
        <ReactReduxContext.Provider value={store}>
            {children}
        </ReactReduxContext.Provider>
    )
}
```
Provider 里面还需要一个***发布-订阅器***。
```
class Subscription {
    constructor(store) {
        this.store = store;
        this.listeners = [this.handleChangeWrapper];
    }
    notify = () => {
        this.listeners.forEach(listener => {
            listener()
        });
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    // 监听 store
    trySubscribe() {
        this.unsubscribe = this.store.subscribe(this.notify);
    }
    // onStateChange 需要在组件中设置
    handleChangeWrapper = () => {
        if (this.onStateChange) {
          this.onStateChange()
        }
    }
    unsubscribe() {
        this.listeners = null;
        this.unsubscribe();
    }
}

```
将 Provider 和 Subscription 结合到一起，在 useEffect 里面注册监听。
```
// Provider.js
const Provider = ({ store, children }) => {
    const contextValue = useMemo(() => {
        const subscription = new Subscription(store);
        return {
            store,
            subscription
        }
    }, [store]);
    // 监听 store 变化
    useEffect(() => {
        const { subscription } = contextValue;
        subscription.trySubscribe();
        return () => {
            subscription.unsubscribe();
        }
    }, [contextValue]);
    return (
        <ReactReduxContext.Provider value={contextValue}>
            {children}
        </ReactReduxContext.Provider>
    )
}
```
### connect
再来看 connect 的实现，这里主要有三步：

 1. 使用 useContext 获取到传入的 store 和 subscription。
 2. 对 subscription 添加一个 listener，这个 listener 的作用就是一旦 store 变化就重新渲染组件。
 3. store 变化之后，执行 mapStateToProps 和 mapDispatchToProps 两个函数，将其和传入的 props 进行合并，最终传给 WrappedComponent。

先来实现简单的获取 Context。
```
const connect = (mapStateToProps, mapDispatchToProps) => (WrappedComponent) => {
    return function Connect(props) {
        const { store, subscription } = useContext(ReactReduxContext);
        return <WrappedComponent {...props} />
    }
}
```
接下来就要来实现如何在 store 变化的时候更新这个组件。
我们都知道在 React 中想实现更新组件只有手动设置 state 和调用 forceUpdate 两种方法，这里使用 useState 每次设置一个 count 来触发更新。
```
const connect = (mapStateToProps, mapDispatchToProps) => {
    return (WrappedComponent) => {
        return (props) => {
            const { store, subscription } = useContext(ReactReduxContext);
            const [count, setCount] = useState(0)
            useEffect(() => {
                subscription.onStateChange = () => setCount(count + 1)
            }, [count])
            const newProps = useMemo(() => {
                const stateProps = mapStateToProps(store.getState()),
                    dispatchProps = mapDispatchToProps(store.dispatch);
                return {
                    ...stateProps,
                    ...dispatchProps,
                    ...props
                }
            }, [props, store, count])
            return <WrappedComponent {...newProps} />
        }
    }
}
```
react-redux 的原理和上面比较类似，这里只作为学习原理的一个例子，不建议用到生产环境中。