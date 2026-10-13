import { defineConfig, globalIgnores } from 'eslint/config';
import ts from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';
export default defineConfig([globalIgnores(['.next/**','node_modules/**','public/vendor/**','public/fonts/**','backups/**','playwright-report/**','test-results/**','.cache/**','evidence-private/**']),...ts.configs.recommended,{files:['**/*.tsx'],plugins:{'react-hooks':hooks,'jsx-a11y':a11y},rules:{'react-hooks/rules-of-hooks':'error',...a11y.configs.recommended.rules,'jsx-a11y/anchor-is-valid':'off'}},{rules:{'@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}]}}]);
