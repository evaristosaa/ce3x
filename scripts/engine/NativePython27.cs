using System;
using System.IO;
using System.Runtime.InteropServices;

// Host only the installed CE3X runtime; no application binaries are distributed.
public static class NativePython27 {
    [StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)]
    struct ActivationContext {
        public int cbSize; public uint dwFlags; public string lpSource;
        public ushort wProcessorArchitecture; public ushort wLangId;
        public string lpAssemblyDirectory; public IntPtr lpResourceName;
        public string lpApplicationName; public IntPtr hModule;
    }
    [DllImport("kernel32",CharSet=CharSet.Unicode,SetLastError=true)]
    static extern IntPtr CreateActCtx(ref ActivationContext context);
    [DllImport("kernel32",SetLastError=true)]
    static extern bool ActivateActCtx(IntPtr context,out UIntPtr cookie);
    [DllImport("kernel32",SetLastError=true)]
    static extern bool DeactivateActCtx(uint flags,UIntPtr cookie);
    [DllImport("kernel32")]
    static extern void ReleaseActCtx(IntPtr context);
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
        if(!SetDllDirectory(root)) return 69;
        IntPtr context=IntPtr.Zero;
        UIntPtr cookie=UIntPtr.Zero;
        string manifest=Path.Combine(root,"Microsoft.VC90.CRT.manifest");
        if(File.Exists(manifest)) {
            ActivationContext settings=new ActivationContext();
            settings.cbSize=Marshal.SizeOf(typeof(ActivationContext));settings.dwFlags=4;
            settings.lpSource=manifest;settings.lpAssemblyDirectory=root;
            context=CreateActCtx(ref settings);
            if(context==new IntPtr(-1)) return 70;
            if(!ActivateActCtx(context,out cookie)) {ReleaseActCtx(context);return 70;}
            // Initialize the runtime in its declared side-by-side context before wx loads.
            if(LoadLibrary(Path.Combine(root,"msvcr90.dll"))==IntPtr.Zero) {
                DeactivateActCtx(0,cookie);ReleaseActCtx(context);return 69;
            }
        }
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
        // wx can add nested activation contexts. Keep the runtime context active
        // until this single-use host exits; Windows reclaims its handles then.
    }
}
