## chlid_process

> 有种web worker的味道

child_process.spawn() 方法异步地衍生子进程，且不阻塞 Node.js 事件循环。 child_process.spawnSync() 方法则以同步的方式提供等效功能，但会阻止事件循环直到衍生的进程退出或终止。

hild_process 模块提供了 child_process.spawn() 和 child_process.spawnSync() 的一些同步和异步的替代方法。 注意，这些替代方法中的每一个都是基于 child_process.spawn() 或 child_process.spawnSync() 实现的。
1.  child_process.exec(): 衍生一个 shell 并在该 shell 中运行命令，当完成时则将 stdout 和 stderr 传给回调函数。(会衍生shell环境)
2.  child_process.execFile(): 类似于 child_process.exec()，除了它默认会直接衍生命令且不首先衍生 shell。（不会衍生shell环境）
3.  child_process.fork(): 衍生一个新的 Node.js 进程，并通过建立 IPC 通信通道来调用指定的模块，该通道允许在父进程与子进程之间发送消息。
4.  child_process.execSync(): child_process.exec() 的同步版本，会阻塞 Node.js 事件循环。
5.  child_process.execFileSync(): child_process.execFile() 的同步版本，会阻塞 Node.js 事件循环。


每个方法都返回 ChildProcess 实例。 这些对象实现了 Node.js 的 EventEmitter API，允许父进程注册监听器函数，在子进程生命周期中当发生某些事件时调用。

```
// 仅限 Windows 系统。
const { spawn } = require('child_process');
const bat = spawn('cmd.exe', ['/c', 'my.bat']);

bat.stdout.on('data', (data) => {
  console.log(data.toString());
});

bat.stderr.on('data', (data) => {
  console.log(data.toString());
});

bat.on('exit', (code) => {
  console.log(`子进程退出码：${code}`);
});


// 或：
const { exec } = require('child_process');
exec('my.bat', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

// 文件名中包含空格的脚本：
const bat = spawn('"my script.cmd"', ['a', 'b'], { shell: true });
// 或：
exec('"my script.cmd" a b', (err, stdout, stderr) => {
  // ...
});
```


因为其他几个api都是基于spawn的，所以这里是只要讲一下spawn都干了些什么？以及这么干的意义

默认情况下，父进程会等待被分离的子进程退出。 为了防止父进程等待 subprocess，可以使用 subprocess.unref()。 这样做会导致父进程的事件循环不包含子进程的引用计数，使得父进程独立于子进程退出，除非子进程和父进程之间建立了一个 IPC 信道。

当使用 detached 选项来启动一个长期运行的进程时，该进程不会在父进程退出后保持在后台运行，除非指定一个不连接到父进程的 stdio 配置。 如果父进程的 stdio 是继承的，则子进程会保持连接到控制终端。

```
//  例子，一个长期运行的进程，为了忽视父进程的终止，通过分离且忽视其父进程的 stdio 文件描述符来实现：

const { spawn } = require('child_process');

const subprocess = spawn(process.argv[0], ['child_program.js'], {
  detached: true,
  stdio: 'ignore'
});

subprocess.unref();


//  也可以将子进程的输出重定向到文件：

const fs = require('fs');
const { spawn } = require('child_process');
const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./out.log', 'a');

const subprocess = spawn('prg', [], {
  detached: true,
  stdio: [ 'ignore', out, err ]
});

subprocess.unref();
```

上面关键的一点就是stdio。

stdio 选项用于配置在父进程和子进程之间建立的管道。 默认情况下，子进程的 stdin、 stdout 和 stderr 被重定向到 ChildProcess 对象上的相应 subprocess.stdin、subprocess.stdout 和 subprocess.stderr 流。 这相当于将 options.stdio 设置为 ['pipe', 'pipe', 'pipe']。

为方便起见， options.stdio 可以是以下字符串之一：

'pipe' - 相当于 ['pipe', 'pipe', 'pipe']（默认值）。
'ignore' - 相当于 ['ignore', 'ignore', 'ignore']。
'inherit' - 相当于 ['inherit', 'inherit', 'inherit'] 或 [0, 1, 2]。

1.  'pipe' - 在子进程和父进程之间创建一个管道。 管道的父端作为 child_process 对象上的属性 subprocess.stdio[fd] 暴露给父进程。 为 fd 0 - 2 创建的管道也可分别作为 subprocess.stdin、subprocess.stdout 和 subprocess.stderr 使用。
2.  'ipc' - 创建一个 IPC 通道，用于在父进程和子进程之间传递消息或文件描述符。 一个 ChildProcess 最多可以有一个 IPC stdio 文件描述符。 设置此选项将启用 subprocess.send() 方法。 如果子进程是 Node.js 进程，则 IPC 通道的存在将启用 process.send() 和 process.disconnect() 方法、以及子进程内的 'disconnect' 和 'message' 事件。

不支持以 process.send() 以外的任何方式访问 IPC 通道 fd，或者使用不具有 Node.js 实例的子进程使用 IPC 通道。

3.  'ignore' - 指示 Node.js 忽略子进程中的 fd。 虽然 Node.js 将始终为它衍生的进程打开 fd 0 - 2，但将 fd 设置为 'ignore' 将导致 Node.js 打开 /dev/null 并将其附加到子进程的 fd。

4.  'inherit' - 将相应的 stdio 流传给父进程或从父进程传入。 在前三个位置，这分别相当于 process.stdin、 process.stdout 与 process.stderr。 在任何其他位置则相当于 'ignore'。
5.  <Stream> 对象 - 与子进程共享指向 tty、文件、套接字或管道的可读或可写流。 流的底层文件描述符在子进程中复制到与 stdio 数组中的索引对应的 fd。 注意，流必须具有底层描述符（文件流直到触发 'open' 事件才需要）。


用例：
1.  通过child_process处理server请求

```
//  sendHandle 参数可用于将一个 TCP server 对象句柄传给子进程，如下所示：
const subprocess = require('child_process').fork('subprocess.js');

// 开启 server 对象，并发送该句柄。
const server = require('net').createServer();
server.on('connection', (socket) => {
  socket.end('被父进程处理');
});
server.listen(1337, () => {
  subprocess.send('server', server);
});

//  子进程接收 server 对象如下：

process.on('message', (m, server) => {
  if (m === 'server') {
    server.on('connection', (socket) => {
      socket.end('被子进程处理');
    });
  }
});
```

2.  发送 socket 对象

```
//  sendHandle 参数可用于将一个 socket 句柄传给子进程。 以下例子衍生了两个子进程，分别用于处理 "normal" 连接或优先处理 "special" 连接：

const { fork } = require('child_process');
const normal = fork('subprocess.js', ['normal']);
const special = fork('subprocess.js', ['special']);

// 开启 server，并发送 socket 给子进程。
// 使用 `pauseOnConnect` 防止 socket 在被发送到子进程之前被读取。
const server = require('net').createServer({ pauseOnConnect: true });
server.on('connection', (socket) => {

  // 特殊优先级。
  if (socket.remoteAddress === '74.125.127.100') {
    special.send('socket', socket);
    return;
  }
  // 普通优先级。
  normal.send('socket', socket);
});
server.listen(1337);


//  subprocess.js 会接收到一个 socket 句柄，并作为第二个参数传给事件回调函数：

process.on('message', (m, socket) => {
  if (m === 'socket') {
    if (socket) {
      // 检查客户端 socket 是否存在。
      // socket 在被发送与被子进程接收这段时间内可被关闭。
      socket.end(`请求被 ${process.argv[2]} 优先级处理`);
    }
  }
});

//建议在子进程中的任何 message 处理程序都需要验证 socket 是否存在，因为连接可能会在它在发送给子进程的这段时间内被关闭。
```