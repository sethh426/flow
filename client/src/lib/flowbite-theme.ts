// Flowbite theme customization
type FlowbiteTheme = any; // Type definition for Flowbite theme

export const flowbiteTheme: FlowbiteTheme = {
  button: {
    color: {
      primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 text-white',
      secondary: 'bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 text-white',
      success: 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 text-white',
      danger: 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 text-white',
      warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 text-white',
      info: 'bg-cyan-600 hover:bg-cyan-700 focus:ring-4 focus:ring-cyan-300 text-white',
    },
    size: {
      xs: 'text-xs px-2 py-1',
      sm: 'text-sm px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-5 py-2.5',
      xl: 'text-base px-6 py-3',
    },
  },
  card: {
    root: {
      base: 'flex rounded-lg border border-gray-200 bg-white shadow-md hover:shadow-lg transition-all duration-300',
      children: 'flex h-full flex-col justify-center gap-4 p-6',
    },
  },
  textInput: {
    field: {
      input: {
        base: 'block w-full border disabled:cursor-not-allowed disabled:opacity-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        colors: {
          gray: 'bg-gray-50 border-gray-300 text-gray-900',
        },
      },
    },
  },
  textarea: {
    base: 'block w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500',
  },
  label: {
    root: {
      base: 'text-sm font-medium text-gray-900 mb-2 block',
    },
  },
  modal: {
    root: {
      base: 'fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full',
      show: {
        on: 'flex bg-gray-900 bg-opacity-50 backdrop-blur-sm',
        off: 'hidden',
      },
    },
    content: {
      base: 'relative h-full w-full p-4 md:h-auto',
      inner: 'relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow-2xl',
    },
  },
  accordion: {
    root: {
      base: 'divide-y divide-gray-200 border border-gray-200 rounded-lg',
    },
    content: {
      base: 'p-5 first:rounded-t-lg last:rounded-b-lg bg-white',
    },
    title: {
      base: 'flex w-full items-center justify-between p-5 text-left font-medium text-gray-900 first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50 transition-colors',
      open: {
        on: 'bg-gray-50',
        off: '',
      },
    },
  },
  alert: {
    base: 'flex flex-col gap-2 p-4 text-sm rounded-lg',
    color: {
      info: 'border-t-4 border-cyan-500 bg-cyan-50 text-cyan-800',
      failure: 'border-t-4 border-red-500 bg-red-50 text-red-800',
      success: 'border-t-4 border-green-500 bg-green-50 text-green-800',
      warning: 'border-t-4 border-yellow-500 bg-yellow-50 text-yellow-800',
    },
  },
  badge: {
    root: {
      base: 'flex h-fit items-center gap-1 font-semibold rounded px-2 py-0.5',
      color: {
        info: 'bg-cyan-100 text-cyan-800',
        failure: 'bg-red-100 text-red-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        indigo: 'bg-indigo-100 text-indigo-800',
        purple: 'bg-purple-100 text-purple-800',
      },
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
      },
    },
  },
  spinner: {
    base: 'inline animate-spin text-gray-200',
    color: {
      info: 'fill-cyan-600',
      failure: 'fill-red-600',
      success: 'fill-green-500',
      warning: 'fill-yellow-400',
      purple: 'fill-purple-600',
      indigo: 'fill-indigo-600',
    },
    size: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-10 h-10',
    },
  },
};
