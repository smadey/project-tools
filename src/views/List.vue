<template>
  <div>
    <div class="el-form-item">
      <el-button type="primary">
        <router-link :to="{ name: 'projAdd' }">新增项目</router-link>
      </el-button>
    </div>
    <el-table :data="projects">
      <el-table-column prop="name" label="项目名称" width="120px" />
      <el-table-column label="项目目录">
        <template slot-scope="{ row: proj }">
          <el-button
            type="text"
            size="small"
            @click="onOpenProject(proj)"
          >{{proj.path}}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="命令" width="120px">
        <template slot-scope="{ row: proj }">
          <template v-for="(command, index) in proj.commands">
            <div :key="index" :style="index ? 'margin-top:10px' : null">
              <el-button
                size="mini"
                @click="onExecCommand(command, proj)"
              >{{command.alias}}</el-button>
            </div>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="{ row: proj }">
          <el-button
            type="text"
            size="small"
          >
            <router-link
              :to="{
                name: 'projEdit',
                params: { id: proj.id }
              }"
            >编辑</router-link>
          </el-button>
          <el-button
            type="text"
            size="small"
            @click="onRemoveProject(proj)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { shell } from 'electron'

import exec from '@/utils/exec'
import db from '@/db'

export default {
  data() {
    return {
      projects: [],
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      db.project.list().then((projects) => {
        this.projects = projects
      })
    },
    onOpenProject(project) {
      shell.showItemInFolder(project.path)
    },
    onExecCommand(command, project) {
      exec(command.script, { cwd: project.path })
    },
    onRemoveProject(project) {
      this.$confirm('删除之后不可恢复, 是否继续?', '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        db.project.remove({ id: project.id }).then(() => {
          this.loadData()
          this.$message({
            type: 'success',
            message: '删除成功',
            showClose: true,
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
