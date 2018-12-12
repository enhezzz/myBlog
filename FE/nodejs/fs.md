##fs（文件系统）
> const fs = require('fs');

* fs.createReadStream(path[, options])#



path (string) | (Buffer) | (URL)

options (string) | (Object)

flags <string> 详见支持的 flag。默认为 'r'。

encoding <string> 默认为 null。

fd <integer> 默认为 null。文件描述符。

mode <integer> 默认为 0o666。

autoClose <boolean> 默认为 true。

start <integer>

end <integer> 默认为 Infinity。

highWaterMark <integer> 默认为 64 * 1024。

返回: <fs.ReadStream> 详见可读流。

可读流的 highWaterMark 一般默认为 16 kb，但本方法返回的可读流默认为 64 kb。
start 与 end 用于从文件读取指定范围的字节。 start 与 end 都是包括在内的。 如果指定了 fd 且不指定 start，则从当前位置开始读取。
如果指定了 fd，则忽略 path。 这意味着不会触发 'open' 事件。 fd 必须是阻塞的，非阻塞的 fd 应该传给 net.Socket。
如果 fd 是一个只支持阻塞读取（比如键盘或声卡）的字符设备，则读取操作在读取到数据之前不会结束。 这可以避免进程退出或者流被关闭。

// 从字符设备创建可读流。

```
const stream = fs.createReadStream('/dev/input/event0');

setTimeout(() => {
  stream.close(); // 这不会关闭流。
  // 必须手动地指示流已到尽头，流才会关闭。
  // 这不会取消读取操作的等待，进程在读取完成前不会退出。
  stream.push(null);
  stream.read(0);
}, 100);
```
如果 autoClose 设为 false，则文件描述符不会自动关闭，即使发生错误。 应用程序需要负责关闭它，并且确保没有文件描述符泄漏。 如果 autoClose 设为 true（默认），则文件描述符在 error 或 end 事件时会自动关闭。

mode 用于设置文件模式（权限），但仅限创建文件时有效。

例子，从一个大小为 100 字节的文件中读取最后 10 个字节：

fs.createReadStream('sample.txt', { start: 90, end: 99 });
如果 options 是一个字符串，则指定字符编码。



* fs.createWriteStream(path[, options])


path (string) | (Buffer) | (URL)

options (string) | (Object)

flags <string> 详见支持的 flag。默认为 'w'。

encoding <string> 默认为 'utf8'。

fd <integer> 默认为 null。文件描述符。

mode <integer> 默认为 0o666。

autoClose <boolean> 默认为 true。

start <integer>

返回: <fs.WriteStream> 详见可写流。
start 用于写入数据到文件的指定位置。 如果要修改文件而不是覆盖文件，则 flags 应为 r+ 而不是默认的 w。

如果 autoClose 设为 true（默认），则文件描述符在 error 或 finish 事件时会自动关闭。 如果 autoClose 设为 false，则文件描述符不会自动关闭，即使发生错误。 应用程序需要负责关闭它，并且确保没有文件描述符泄漏。

如果指定了 fd，则忽略 path。 这意味着不会触发 'open' 事件。 fd 必须是阻塞的，非阻塞的 fd 应该传给 net.Socket。

如果 options 是一个字符串，则指定字符编码。


####flag 可选的值如下：

'a' - 打开文件用于追加。如果文件不存在则创建文件。

'ax' - 类似 'a'，但如果文件已存在则抛出异常。

'a+' - 打开文件用于读取和追加。如果文件不存在则创建文件。

'ax+' - 类似 'a+'，但如果文件已存在则抛出异常。

'as' - 以同步模式打开文件用于追加。如果文件不存在则创建文件。

'as+' - 以同步模式打开文件用于读取和追加。如果文件不存在则创建文件。

'r' - 打开文件用于读取。如果文件不存在则抛出异常。

'r+' - 打开文件用于读取和写入。如果文件不存在则抛出异常。

'rs+' - 以同步模式打开文件用于读取和写入。指示操作系统绕开本地文件系统缓存。

主要用于在 NFS 挂载上打开文件，可以跳过可能存在的本地缓存。 对 I/O 性能有较大影响，除非需要否则不建议使用。

不会将 fs.open() 或 fsPromises.open() 变成同步的阻塞调用。 如果期望同步的操作，应该使用类似 fs.openSync() 的方法。

'w' - 打开文件用于写入。如果文件不存在，则创建文件；如果文件已存在，则截断文件。

'wx' - 类似 'w'，但如果文件已存在则抛出异常。

'w+' - 打开文件用于读取和写入。如果文件不存在，则创建文件；如果文件已存在，则截断文件。

'wx+' - 类似 'w+'，但如果文件已存在则抛出异常。

flag 也可以是一个数值，参见 open(2)。 常用的常量都定义在 fs.constants 上。 在 Windows 上，flag 会被转换成等效的其他 flag，例如 O_WRONLY 转换成 FILE_GENERIC_WRITE、O_EXCL|O_CREAT 转换成 CREATE_NEW。

'x'（ open(2) 中的 O_EXCL）可以确保文件是新创建的。 在 POSIX 系统上，即使是指向不存在的文件的符号链接，也会视为文件已存在。 该 flag 在网络文件系统中可能无效。

在 Linux 上，当以追加模式打开文件时，不能指定写入的位置。 内核会忽略位置参数，总是将数据追加到文件的尾部。

如果要修改文件而不是覆盖文件，则应该使用 'r+' 而不是默认的 'w'。

有些 flag 的行为因平台而异。 例如，在 macOS 和 Linux 上，以 'a+' 打开目录会返回错误。 但在 Windows 和 FreeBSD 上，则返回文件描述符或 FileHandle。
````
// 在 macOS 和 Linux 上：
fs.open('<目录>', 'a+', (err, fd) => {
  // => [Error: EISDIR: illegal operation on a directory, open <directory>]
});

// 在 Windows 和 FreeBSD 上：
fs.open('<目录>', 'a+', (err, fd) => {
  // => null, <fd>
});
````
在 Windows 上，使用 'w'（无论是 fs.open()、fs.writeFile() 或 fsPromises.open()）打开隐藏文件会抛出 EPERM。 隐藏文件可以使用 'r+' 打开用于写入。

调用 fs.ftruncate() 或 fsPromises.ftruncate() 可以用于重置文件的内容。