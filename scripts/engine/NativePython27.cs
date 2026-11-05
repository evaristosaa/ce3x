using System;
using System.IO;
using System.Runtime.InteropServices;

// Host only the installed CE3X runtime; no application binaries are distributed.
public static class NativePython27 {
    [DllImport("kernel32", SetLastError=true, CharSet=CharSet.Unicode)]
    static extern IntPtr LoadLibrary(string path);
    [DllImport("kernel32", SetLastError=true, CharSet=CharSet.Unicode)]
    static extern bool SetDllDirectory(string path);
    [DllImport("kernel32", SetLastError=true)]
    static extern IntPtr GetProcAddress(IntPtr module, string name);
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
    delegate int PythonMain(int argc, IntPtr argv);

    public static int Main(string[] args) {
        if (args.Length != 2) return 64;
        string root=Path.GetFullPath(args[0]);
        string worker=Path.GetFullPath(args[1]);
        if (!File.Exists(Path.Combine(root,"ce3xv3.2.exe")) || !File.Exists(worker)) return 66;
        Environment.SetEnvironmentVariable("PYTHONHOME",root);
        Environment.SetEnvironmentVariable("PYTHONPATH",root);
        Environment.SetEnvironmentVariable("PYTHONIOENCODING","utf-8");
        Environment.SetEnvironmentVariable("PATH",root+";"+Environment.GetEnvironmentVariable("PATH"));
        SetDllDirectory(root);
        IntPtr module=LoadLibrary(Path.Combine(root,"python27.dll"));
        if (module==IntPtr.Zero) return 69;
        IntPtr entry=GetProcAddress(module,"Py_Main");
        if (entry==IntPtr.Zero) return 69;
        PythonMain run=(PythonMain)Marshal.GetDelegateForFunctionPointer(entry,typeof(PythonMain));
        string[] pythonArgs={"python",worker};
        IntPtr[] strings=new IntPtr[pythonArgs.Length];
        IntPtr argv=IntPtr.Zero;
        try {
            for (int i=0;i<strings.Length;i++) strings[i]=Marshal.StringToHGlobalAnsi(pythonArgs[i]);
            argv=Marshal.AllocHGlobal(IntPtr.Size*strings.Length);
            Marshal.Copy(strings,0,argv,strings.Length);
            return run(strings.Length,argv);
        } finally {
            if (argv!=IntPtr.Zero) Marshal.FreeHGlobal(argv);
            foreach(IntPtr value in strings) if(value!=IntPtr.Zero) Marshal.FreeHGlobal(value);
        }
    }
}
