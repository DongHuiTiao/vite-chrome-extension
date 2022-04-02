module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		'plugin:vue/vue3-essential',
		'plugin:vue/recommended',
		'eslint:recommended',
		'@vue/standard',
		'@vue/prettier',
	], // "@vue/prettier"
	parserOptions: {
		parser: 'babel-eslint',
	},
	rules: {
		// 'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'prettier/prettier': [
			'warn',
			{
				// singleQuote: none,
				// semi: false,
				trailingComma: 'es5',
			},
		],
		'vue/valid-define-props': 'off',
	},
};
