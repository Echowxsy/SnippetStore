const electron = require('electron')
const os = require('os')
const { checkForUpdate, downloadAndInstall } = require('./app-updator')
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog

function getAppInfo () {
  const info = `
Version: ${process.getVersion()}
Commit: ${process.getCommit()}
Electron: ${process.versions.electron}
Chrome: ${process.versions.chrome}
Node.js: ${process.versions.node}
V8: ${process.versions.v8}
OS: ${os.type()} ${os.arch()} ${os.release()}`
  return info
}

function getMenu (app, mainWindow) {
  const macOS = process.platform === 'darwin'

  const file = {
    label: 'File',
    submenu: [
      {
        label: '退出',
        accelerator: macOS ? 'Command+Q' : 'Alt+F4',
        click () {
          app.quit()
        }
      }
    ]
  }

  const snippet = {
    label: '代码片段',
    submenu: [
      {
        label: '创建代码片段',
        accelerator: macOS ? 'Command+N' : 'Control+N',
        click () {
          mainWindow.webContents.send('modal:open', 'pickSnippetTypeModal')
        }
      },
      {
        label: '创建单文件代码片段',
        click () {
          mainWindow.webContents.send('modal:open', 'createSnippetModal')
        }
      },
      {
        label: '创建多文件代码片段',
        click () {
          mainWindow.webContents.send(
            'modal:open',
            'createMultiFilesSnippetModal'
          )
        }
      },
      {
        label: '导入所有代码片段',
        click () {
          dialog.showOpenDialog(
            BrowserWindow.getFocusedWindow(),
            {
              title: '选择需要导入的JSON文件',
              properties: ['openFile'],
              buttonLabel: '导入'
            },
            paths => {
              if (paths && paths[0]) {
                const file = paths[0]
                mainWindow.webContents.send('snippet:import', file)
              }
            }
          )
        }
      },
      {
        label: '导出所有代码片段',
        click () {
          dialog.showOpenDialog(
            BrowserWindow.getFocusedWindow(),
            {
              title: '选择导出文件夹',
              properties: ['openDirectory'],
              buttonLabel: '导出'
            },
            paths => {
              if (paths && paths[0]) {
                const folder = paths[0]
                mainWindow.webContents.send('snippet:exportAll', folder)
              }
            }
          )
        }
      }
    ]
  }

  const help = {
    label: '帮助',
    submenu: [
      {
        label: '打开调试工具',
        accelerator: macOS ? 'Command+Alt+I' : 'Control+Shift+I',
        click () {
          BrowserWindow.getFocusedWindow().toggleDevTools()
        }
      },
      {
        label: '重载窗口',
        accelerator: macOS ? 'Command+Alt+R' : 'Control+Shift+R',
        click () {
          BrowserWindow.getFocusedWindow().reload()
        }
      },
      {
        label: '关于',
        click () {
          dialog.showMessageBox({
            type: 'info',
            title: 'Snippet Store',
            message: 'Snippet Store',
            detail: getAppInfo(),
            buttons: ['好']
          })
        }
      },
      {
        label: '检查更新',
        click () {
          checkForUpdate().then(hasNewUpdate => {
            if (hasNewUpdate) {
              dialog.showMessageBox(
                {
                  type: 'info',
                  title: 'Snippet Store',
                  message: 'A new version is available!',
                  detail:
                    'A new version of SnippetStore is now available, please update to receive the latest bugfixes and features',
                  buttons: ['Update', 'Later']
                },
                response => {
                  if (response === 0) {
                    downloadAndInstall()
                  }
                }
              )
            } else {
              dialog.showMessageBox({
                type: 'info',
                title: 'Snippet Store',
                message: '没有新的版本',
                detail: '您已经是最新版本了',
                buttons: ['好']
              })
            }
          })
        }
      }
    ]
  }

  const edit = {
    label: '编辑',
    submenu: [
      { role: 'undo', label: '撤销' },
      { role: 'redo', label: '重做' },
      { type: 'separator' },
      { role: 'cut', label: '剪切' },
      { role: 'copy', label: '复制' },
      { role: 'paste', label: '粘贴' },
      { role: 'pasteandmatchstyle', label: '格式粘贴' },
      { role: 'delete', label: '删除' },
      { role: 'selectall', label: '全选' }
    ]
  }

  return [file, edit, snippet, help]
}

module.exports = getMenu
