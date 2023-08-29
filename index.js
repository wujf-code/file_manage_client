const { createApp, ref, reactive, onMounted } = Vue
const { ElMessage } = ElementPlus
const app = createApp({
    setup() {
        const message = ref('Hello vue!')
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
                command: '1',
                label: '上传文件夹（不含根目录）',
                disabled: false
            }
        ])
        const handleCommand = (command) => {
            if (command === '0') {
                drawer.value = true
            }
        }
        const drawer = ref(false)
        const ondragenter = (e) => {
        }
        const ondragover = (e) => {
        }
        const uploadList = reactive([])
        const upload = (index)=>{
            const file  = uploadList[index - 1].file
            let formData = new FormData()
            formData.append('fs',file)
            axios.post('http://localhost:3000/fs/upload',formData,{
                headers:{
                    'Content-Type':'multipart/form-data',
                },
                onUploadProgress:function(progressEvent){
                    uploadList[index-1].progress = Math.floor((progressEvent.loaded/progressEvent.total)* 100)
                }
            }).then(d=>{
                uploadList[index - 1].status = 'success'
            }).catch(e=>{
                uploadList[index - 1].status = 'fail'
            })
        }
        const ondrop = (e) => {
            for (const item of e.dataTransfer.items) {
                const entry = item.webkitGetAsEntry()
                if (entry.isDirectory) {
                    ElMessage({
                        message:'不支持文件夹拖拽上传',
                        type:'warning'
                    })
                }else {
                    entry.file(f=>{
                        let index = uploadList.push({status:'pending',progress:0,file:f})
                        upload(index) 
                    })
                }
            }
        }
        const getList =async function(params) {
            return await axios.get('http://localhost:3000/fs/list',{params})
        }
        const fileList = reactive([])
        const total = ref(0)
        onMounted(async() => {
            const {data} = await getList({pageNum:1,pageSize:10})
            fileList.push(...data.data)
            total.value = data.total
        })
        return {
            message,
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
            fileList
        }
    }
})
// console.log(ElementPlusIconsVue);
app.use(ElementPlus)
app.component('UploadFilled', ElementPlusIconsVue.UploadFilled)
app.component('ArrowDown', ElementPlusIconsVue.ArrowDown)
app.mount('#app')

