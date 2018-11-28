<template>
  <el-form
    ref="form"
    :model="model"
    :rules="rules"
    label-width="120px"
     style="max-width:1000px"
  >
    <h3>{{isAdd ? '新增项目' : '编辑项目'}}</h3>
    <el-form-item label="项目名称" prop="name">
      <el-input v-model="model.name" />
    </el-form-item>
    <el-form-item label="项目路径" prop="path">
      <div @click="onChangeDirectory">
        <el-input :value="model.path" readonly>
          <template slot="append"><i class="el-icon-edit" /></template>
        </el-input>
      </div>
    </el-form-item>
    <el-form-item label="命令列表">
      <el-table :data="commands">
        <el-table-column label="命令别名" width="150">
          <template slot-scope="{ row: command }">
            <el-input
              v-if="command.$editing"
              size="mini"
              v-model="command.alias"
            />
            <template v-else>{{command.alias}}</template>
          </template>
        </el-table-column>
        <el-table-column label="命令脚本">
          <template slot-scope="{ row: command }">
            <el-input
              v-if="command.$editing"
              size="mini"
              v-model="command.script"
            />
            <template v-else>{{command.script}}</template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100px">
          <template slot-scope="{ row: command }">
            <el-button
              v-if="command.$editing"
              size="mini"
              type="success"
              icon="el-icon-check"
              circle
              @click="onSaveCommand(command)"
            />
            <el-button
              v-else
              size="mini"
              type="primary"
              icon="el-icon-edit"
              circle
              @click="onEditCommand(command)"
            />
            <el-button
              v-if="!command.$new"
              size="mini"
              type="danger"
              icon="el-icon-delete"
              circle
              @click="onRemoveCommand(command)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="onSubmit">保存</el-button>
      <el-button @click="$router.back()">返回</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { remote } from 'electron'

import db from '@/db'
import uuid from '@/utils/uuid'

class Command {
  static keys = ['alias', 'script'];

  constructor(data) {
    Command.keys.forEach((key) => {
      this[key] = null
    })

    if (data) {
      Object.assign(this, data)
      this.$editing = false
    } else {
      this.$new = true
      this.$editing = true
    }
  }
  edit() {
    Command.keys.forEach((key) => {
      this[`_${key}`] = this[key]
    })
    this.$editing = true
  }
  save() {
    this.$new = false
    this.$editing = false
  }
  toJSON() {
    return Command.keys.reduce((obj, key) => ({
      ...obj,
      [key]: this.$editing ? this[`_${key}`] : this[key],
    }), {})
  }
}

export default {
  data() {
    return {
      model: {
        name: '',
        path: '',
        commands: [],
      },
      rules: {
        name: [
          { required: true, message: '请输入项目名称', trigger: 'blur' },
        ],
        path: [
          { required: true, message: '请输入项目路径', trigger: 'blur' },
        ],
      },
    }
  },
  computed: {
    isAdd() {
      return !this.$route.params.id
    },
    commands() {
      return this.model.commands.concat(new Command())
    },
  },
  mounted() {
    if (!this.isAdd) {
      db.project.get(this.$route.params).then((project) => {
        this.model = {
          ...project,
          commands: project.commands.map(d => new Command(d)),
        }
      })
    }
  },
  methods: {
    onChangeDirectory() {
      const dir = remote.dialog.showOpenDialog({
        properties: ['openDirectory'],
      })
      if (dir) {
        this.model.path = dir[0]
      }
    },
    onEditCommand(command) {
      command.edit()
    },
    onSaveCommand(command) {
      if (command.alias && command.script) {
        if (command.$new) {
          command.save()
          this.model.commands.push(command)
        } else {
          command.save()
        }
      }
    },
    onRemoveCommand(command) {
      const index = this.model.commands.indexOf(command)
      if (index > -1) {
        this.model.commands.splice(index, 1)
      }
    },
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return false
        }

        db.project.save({
          id: uuid(),
          ...this.model,
          commands: this.model.commands.map(d => d.toJSON()),
        }).then(() => {
          const path = this.$route.fullPath
          this.$message({
            type: 'success',
            message: '保存成功',
            showClose: true,
            onClose: () => {
              if (this.$route.fullPath === path) {
                this.$router.back()
              }
            },
          })
        }).catch((err) => {
          this.$message({
            type: 'error',
            message: err.message,
            showClose: true,
          })
        })
      })
    },
  },
}
</script>

<style scoped>
h3 {
  color: #1f2f3d;
  font-size: 22px;
  font-weight: 400;
  margin-bottom: 24px;
  margin-top: 10px;
  padding-left: 24px;
}
</style>
