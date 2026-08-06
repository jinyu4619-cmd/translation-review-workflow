# 第一次上传到 GitHub

如果你是第一次上传自己的 GitHub 仓库，推荐优先使用 GitHub Desktop，操作会比命令行简单很多。

## 推荐方式：GitHub Desktop

### 第一步：准备 GitHub 账号

1. 打开 GitHub 官网并登录账号。
2. 如果还没有账号，先注册一个。

### 第二步：安装 GitHub Desktop

1. 下载并安装 GitHub Desktop。
2. 安装后使用自己的 GitHub 账号登录。

### 第三步：确认本地文件夹

你现在要上传的文件夹位置是：

`C:\Users\ws\Desktop\翻译核对工作流_GitHub版`

### 第四步：在 GitHub Desktop 中添加本地文件夹

1. 打开 GitHub Desktop。
2. 选择`Add an Existing Repository`或类似入口。
3. 如果提示当前文件夹还不是 Git 仓库，可以选择创建本地仓库。
4. 选择桌面上的`翻译核对工作流_GitHub版`。

### 第五步：填写仓库信息

建议填写：

- Repository name: `translation-review-workflow`
- Description: `A reusable multilingual translation review workflow`
- Local path: 选择桌面上的这个文件夹

如果你更想保留中文名，也可以用中文，但第一次上传通常更推荐英文仓库名。

### 第六步：发布到 GitHub

1. 在 GitHub Desktop 中点击`Publish repository`。
2. 选择`Public`或`Private`。

建议：

- 如果你准备给同事或外部都看，选`Public`
- 如果里面还有未完全脱敏内容，先选`Private`

3. 点击发布。

## 如果你想“加密码”限制别人使用

先说结论：

- GitHub 仓库通常**不是**通过“给仓库单独设置一个共享密码”来限制访问。
- 更接近“加密码”的做法，是把仓库设为`Private`，然后**只邀请指定的 GitHub 账号**访问。

也就是说：

- 不是“谁知道密码谁就能进”
- 而是“只有被你授权的 GitHub 账号才能进”

### 最推荐的做法

如果你只想让少数人使用这个仓库，建议这样做：

1. 发布仓库时选择`Private`
2. 仓库发布后，打开 GitHub 仓库页面
3. 进入`Settings`
4. 在左侧找到`Collaborators`或`Collaborators & teams`
5. 点击`Add people`
6. 输入对方的 GitHub 用户名或邮箱
7. 对方接受邀请后，才能访问这个仓库

### 你需要知道的一点

如果这个仓库是你**个人账号**下的私有仓库，GitHub 官方当前说明是：

- 协作者可以读取仓库内容
- 协作者也可以写入仓库内容
- 个人账号私有仓库**不能只给只读权限**

如果你以后想做得更细，比如：

- A 只能看
- B 可以改
- C 可以管理

那更适合把仓库放到`Organization`里，再做更细的权限管理。

### 如果你只是想“别人能看，但不能改”

对于第一次使用 GitHub 的个人仓库，最简单的建议是二选一：

1. 先用`Private`仓库，只邀请你信任的人
2. 如果你只想发资料给别人看，不强调 GitHub 协作，改用压缩包加密码或网盘权限更直接

### 对你当前场景的建议

如果你这次只是想：

- 先整理好工作流
- 只给少数同事使用
- 又不想公开

最稳的方案是：

1. 先上传为`Private`
2. 只邀请需要使用的同事
3. 等内容成熟、脱敏彻底后，再考虑改成`Public`

### 第七步：打开 GitHub 检查

发布完成后，去 GitHub 页面检查：

- `README.md` 是否显示正常
- 中文文档是否乱码
- 文件结构是否完整
- 是否误传了不该公开的素材

## 如果你暂时不想装 GitHub Desktop

你也可以先在 GitHub 上新建仓库，再网页上传文件。但网页方式不适合频繁更新，也不适合大批量文件。

对于第一次上传自己的完整文件夹，仍然更推荐 GitHub Desktop。

## 上传后第一件事

上传完成后，先打开以下两个文档检查展示效果：

- `README.md`
- `docs/审核标准与流程.md`

## 官方参考

- GitHub Docs: [Setting repository visibility](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
- GitHub Docs: [Inviting collaborators to a personal repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository)
- GitHub Docs: [Permission levels for a personal account repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository)
