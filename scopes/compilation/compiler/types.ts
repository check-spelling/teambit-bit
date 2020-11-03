import { BuildContext, BuildTask, BuiltTaskResult, TaskResultsList } from '@teambit/builder';

export type TranspileOpts = {
  componentDir: string; // absolute path of the component's root directory
  filePath: string; // relative path of the file inside the component directory
};

export type TranspileOutput =
  | {
      outputText: string;
      outputPath: string;
    }[]
  | null;

export interface CompilerOptions {
  /**
   * name of the compiler.
   */
  name?: string;

  /**
   * relative path of the dist directory inside the capsule. e.g. "dist".
   */
  distDir: string;

  /**
   * determines which ones of the generated files will be saved in the bit objects when tagging.
   * e.g. distGlobPatterns = [`${this.distDir}/**`, `!${this.distDir}/tsconfig.tsbuildinfo`];
   * see https://github.com/mrmlnc/fast-glob for the supported glob patters syntax.
   */
  distGlobPatterns?: string[];

  /**
   * whether or not unsupported files (such as assets) should be copied into the dist directory
   */
  shouldCopyNonSupportedFiles?: boolean;

  /**
   * optional. default to "dist".
   * useful when the build pipeline has multiple compiler tasks of the same compiler.
   * e.g. using the same Babel compiler for two different tasks, one for creating "es5" files, and
   * the second for creating "esm". the artifact names would be "es5" and "esm" accordingly.
   */
  artifactName?: string;
}

export interface Compiler extends CompilerOptions {
  /**
   * id of the compiler.
   */
  id: string;

  /**
   * serialized config of the compiler.
   */
  displayConfig?(): string;

  /**
   * transpile a single file. this being used during development and get saved into the workspace
   */
  transpileFile: (fileContent: string, options: TranspileOpts) => TranspileOutput;

  /**
   * compile components inside isolated capsules. this being used during tag for the release.
   * meaning, the final package of the component has the dists generated by this method.
   */
  build(context: BuildContext): Promise<BuiltTaskResult>;

  /**
   * given a source file, return its parallel in the dists. e.g. "index.ts" => "dist/index.js"
   * both, the return path and the given path are relative paths.
   */
  getDistPathBySrcPath(srcPath: string): string;

  /**
   * only supported files matching get compiled. others, are copied to the dist dir.
   */
  isFileSupported(filePath: string): boolean;

  /**
   * sugar to create a Compiler task via the concrete compiler
   */
  createTask?(name?: string): BuildTask;

  /**
   * run before the build pipeline has started. this is useful when some preparation are needed to
   * be done on all envs before the build starts.
   */
  preBuild?(context: BuildContext): Promise<void>;

  /**
   * run after the build pipeline completed for all envs. useful for some cleanups
   */
  postBuild?(context: BuildContext, tasksResults: TaskResultsList): Promise<void>;
}