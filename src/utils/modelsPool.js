// Se intentó rotar los modelos, pero da más problemas que usar "openrouter/free" en el modelo.
// Se mantiene este archivo únicamente para realizar la rotación de API Keys de OpenRouter.

let keyIndex = 0;

export class ModelsPool {
  static getNextKey() {
    const keys = [process.env.OPENROUTER_KEY, process.env.OPENROUTER_KEY2].filter(Boolean);
    if (keys.length === 0) return null;

    const key = keys[keyIndex];
    keyIndex = (keyIndex + 1) % keys.length;
    return key;
  }
}
