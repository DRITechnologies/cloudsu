{
    'targets': [{
        'target_name': 'forsaken',
        'sources': [
            'src/forsaken.cc',
            'src/ssl.cc'
        ],
        'include_dirs': [
            "<!(node -e \"require('nan')\")"
        ],
        'cflags': [ '-O3' ],
        'conditions':
        [[
            'OS=="win"',
            {
                'conditions': [[
                    'target_arch=="x64"',
                    {
                        'variables': {
                            'openssl_root%': 'C:/OpenSSL-Win64'
                        }
                    },
                    {
                        'variables': {
                            'openssl_root%': 'C:/OpenSSL-Win32'
                        }
                    }
                ]],
                'libraries': [
                    '-l<(openssl_root)/lib/libeay32.lib',
                    '-l<(openssl_root)/lib/ssleay32.lib'
                ],
                'include_dirs': [
                    '<(openssl_root)/include'
                ]
            }
        ]]
    }]
}
