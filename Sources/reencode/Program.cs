using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace reencode
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length > 0)
            {
                foreach (var item in args)
                {
                    ProcessDirectory(item);
                }
            }
            else
            {
                var filePath = AppDomain.CurrentDomain.BaseDirectory;
                ProcessDirectory(filePath);
            }
        }

        private static void ProcessDirectory(string filename)
        {
            var files = Directory.GetFiles(filename);
            foreach (var file in files)
            {
                var ext = Path.GetExtension(file);
                if (ext == ".css" || ext == ".js")
                    ProcessFile(file);
            }

            var dirs = Directory.GetDirectories(filename);
            foreach (var dir in dirs)
            {
                if (dir != "bin" && dir != "obj" && dir != "bld")
                    ProcessDirectory(dir);
            }


        }

        private static void ProcessFile(string filename)
        {
            using (StreamReader reader = new StreamReader(filename))
            {
                using (StreamWriter writer = new StreamWriter(filename+".tmp", false, System.Text.UTF8Encoding.UTF8))
                {
                    writer.Write(reader.ReadToEnd());
                }                
            }
            File.Delete(filename);
            File.Move(filename + ".tmp", filename);
        }
    }
}
