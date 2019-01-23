## ArrayBuffer
>   参考 http://es6.ruanyifeng.com/#docs/arraybuffer

产生背景：

这个接口的原始设计目的，与 WebGL 项目有关。所谓 WebGL，就是指器与显卡之间的通信接口，为了满足 JavaScript 与显卡之间大量的时的数据交换，它们之间的数据通信必须是二进制的，而不能是传统的格式。文本格式传递一个 32 位整数，两端的 JavaScript 脚本与显要进行格式转化，将非常耗时。这时要是存在一种机制，可以像 C 语样，直接操作字节，将 4 个字节的 32 位整数，以二进制形式原封不送入显卡，脚本的性能就会大幅提升。


下面就通过言简意赅的方式来进行说明：

1.  ArrayBuffer
    代表内存之中的一段二进制数据，可以通过“视图”进行操作。“视图”部署了数组接口，这意味着，可以用数组的方法操作内存。

2.  视图

    *   类型视图（TypedArray）
    类型视图就是代表能操作的指定单位字节数据的视图。比如：Uint8Array（无符号 8 位整数）数组视图, Int16Array（16 位整数）数组视图, Float32Array（32 位浮点数）数组视图等等。

    *   自定义视图（DataView）
    自定义视图代表能操作不同单位字节数据的视图。比如第一个字节是 Uint8（无符号 8 位整数）、第二、三个字节是 Int16（16 位整数）、第四个字节开始是 Float32（32 位浮点数）等等，此外还可以自定义字节序。


    **简单说，ArrayBuffer对象代表原始的二进制数据，TypedArray视图用来读写简单类型的二进制数据，DataView视图用来读写复杂类型的二进制数据。**

    二进制数组并不是真正的数组，而是类似数组的对象

    很多浏览器操作的 API，用到了二进制数组操作二进制数据，下面是其中的几个。

    *   File API
    *   XMLHttpRequest
    *   Fetch API
    *   Canvas
    *   WebSockets




    ```
    const buf = new ArrayBuffer(32);
    ```
    上面代码生成了一段 32 字节的内存区域，每个字节的值默认都是 0。可以看到，ArrayBuffer构造函数的参数是所需要的内存大小（单位字节）。

    为了读写这段内容，需要为它指定视图。

    ```
    // dataView
    dv.setInt32(0, 25);
    dv.getInt32(0)
    ```

    另一种TypedArray视图，与DataView视图的一个区别是，它不是一个构造函数，而是一组构造函数，代表不同的数据格式。

    ```
    const buffer = new ArrayBuffer(12);

    const x1 = new Int32Array(buffer);
    x1[0] = 1;
    const x2 = new Uint8Array(buffer);
    x2[0]  = 2;

    x1[0] // 2
    ```

    上面代码对同一段内存，分别建立两种视图：32 位带符号整数（Int32Array构造函数）和 8 位不带符号整数（Uint8Array构造函数）。由于两个视图对应的是同一段内存，一个视图修改底层内存，会影响到另一个视图。

    TypedArray视图的构造函数，除了接受ArrayBuffer实例作为参数，还可以接受普通数组作为参数，直接分配内存生成底层的ArrayBuffer实例，并同时完成对这段内存的赋值。

    ```
    const typedArray = new Uint8Array([0,1,2]);
    typedArray.length // 3

    typedArray[0] = 5;
    typedArray // [5, 1, 2]
    ```




3.  应用 

     ES2017 引入SharedArrayBuffer，允许 Worker 线程与主线程共享同一块内存。SharedArrayBuffer的 API 与ArrayBuffer一模一样，唯一的区别是后者无法共享数据。

     ```
     // 主线程

    // 新建 1KB 共享内存
    const sharedBuffer = new SharedArrayBuffer(1024);

    // 主线程将共享内存的地址发送出去
    w.postMessage(sharedBuffer);

    // 在共享内存上建立视图，供写入数据
    const sharedArray = new Int32Array(sharedBuffer);
     ```

     Worker 线程从事件的data属性上面取到数据。

     ```
     // Worker 线程
    onmessage = function (ev) {
    // 主线程共享的数据，就是 1KB 的共享内存
    const sharedBuffer = ev.data;

    // 在共享内存上建立视图，方便读写
    const sharedArray = new Int32Array(sharedBuffer);

    // ...
    };
     ```