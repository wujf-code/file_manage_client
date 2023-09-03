const { createApp, ref, reactive, onMounted } = Vue
const { ElMessage } = ElementPlus
const app = createApp({
    setup() {
        const params = reactive({
            pageNum: 1,
            pageSize: 10
        })
        // 文件列表模式，（0：文件列表模式，1：文件夹模式）
        const listMode = ref('0')
        const modeOptions = reactive([
            {
                value: '0',
                label: '文件列表模式',
                disabled: false
            }, {
                value: '1',
                label: '文件夹模式',
                disabled: true
            }
        ])
        // 上传方式，（0：上传文件，1：上传文件夹（含根目录），2：上传文件夹（不含根目录））
        const uploadMethod = ref('0')
        const uploadOptions = reactive([
            {
                command: '0',
                label: '上传文件',
                disabled: false
            },
            {
                command: '1',
                label: '上传文件夹（含根目录）',
                disabled: true
            },
            {
                command: '2',
                label: '上传文件夹（不含根目录）',
                disabled: false
            }
        ])
        // 下拉菜单点击事件
        const handleCommand = (command) => {
            if (command === '0') {
                drawer.value = true
            } else if (command === '2') {
                myDict.value.click()
            }
        }
        // 是否显示上传文件抽屉
        const drawer = ref(false)
        const uploadList = reactive([])
        // 上传文件
        const upload = (index) => {
            const file = uploadList[index - 1].file
            let formData = new FormData()
            formData.append('fs', file)
            axios.post('http://localhost:3000/fs/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // 上传进度
                onUploadProgress: function (progressEvent) {
                    uploadList[index - 1].progress = Math.floor((progressEvent.loaded / progressEvent.total) * 100)
                }
            }).then(d => {
                uploadList[index - 1].status = 'success'
            }).catch(e => {
                uploadList[index - 1].status = 'fail'
            })
        }
        // 拖拽上传
        const ondragenter = (e) => {
            e.preventDefault()
        }
        const ondragover = (e) => {
            e.preventDefault()
        }
        const ondrop = (e) => {
            e.preventDefault()
            for (const item of e.dataTransfer.items) {
                // 获取文件的类型
                const entry = item.webkitGetAsEntry()
                // 判断是否是文件夹
                if (entry.isDirectory) {
                    // 如果是文件夹，提示不支持文件夹拖拽上传
                    ElMessage({
                        message: '不支持文件夹拖拽上传',
                        type: 'warning'
                    })
                } else {
                    // 如果不是文件夹，获取文件
                    entry.file(f => {
                        // 将文件信息添加到uploadList中
                        let index = uploadList.push({ status: 'pending', progress: 0, file: f })
                        // 将文件信息上传
                        upload(index)
                    })
                }
            }
        }
        const fileList = reactive([])
        const total = ref(0)
        const myFileChange = (e) => {
            e.target.files.forEach(f => {
                let index = uploadList.push({ status: 'pending', progress: 0, file: f })
                upload(index)
            })
        }
        const myDict = ref(null)
        const myDictChange = (e) => {
            drawer.value = true
            for (const f of e.target.files) {
                let index = uploadList.push({ status: 'pending', progress: 0, file: f })
                upload(index)
            }
        }
        const currentChange = async (cur) => {
            params.pageNum = cur
            await getFileList()
        }
        const getFileList = async function () {
            const { data } = await axios.get('http://localhost:3000/fs/list', {params})
            fileList.length = 0
            fileList.push(...data.data)
            total.value = data.total
        }
        const delFile = (id) => {
            axios.delete(`http://localhost:3000/fs/del/${id}`).then(d => {
                ElMessage({
                    message: '删除成功',
                    type: 'success'
                })
                getFileList()
            }).catch(e => {
                ElMessage({
                    message: '删除失败',
                    type: 'error'
                })
            })
        }
        const handleDelete = (index,row)=>{
            delFile(row.fileId)
        }
        onMounted(async () => {
            await getFileList()
        })
        return {
            listMode,
            modeOptions,
            uploadMethod,
            uploadOptions,
            handleCommand,
            drawer,
            ondragenter,
            ondragover,
            ondrop,
            uploadList,
            fileList,
            total,
            myFileChange,
            myDict,
            myDictChange,
            currentChange,
            handleDelete
        }
    }
})
app.use(ElementPlus)
app.component('UploadFilled', ElementPlusIconsVue.UploadFilled)
app.component('ArrowDown', ElementPlusIconsVue.ArrowDown)
app.mount('#app')
