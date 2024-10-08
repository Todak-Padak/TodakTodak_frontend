<template>
  <v-container class="mt-5">
    <v-row align="center">
      <v-col cols="6" md="8" class="d-flex justify-end">
        <div class="d-flex align-center">
          <v-col class="inter-bold title" style="text-align: center;"><img src="@/assets/community.png" width="50px"/> 의사 Q&A</v-col>
        </div>
      </v-col>
    </v-row> <br>
    <v-card class="pa-5" v-if="postDetail">
      <div class="d-flex justify-space-between align-center mb-3">
        <v-divider>
          <v-list-item-title class="text-subtitle-1" style="font-weight: bold; font-size: 20px !important;">{{ postDetail.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ formatDate(postDetail.createdTimeAt) }}</v-list-item-subtitle>
        </v-divider>

        <v-col class="d-flex justify-end" style="flex-grow: 1;">
          <!-- 로그인한 사용자의 이메일을 가져옵니다. -->
          <template v-if="currentUserEmail === postDetail.memberEmail">
            <span @click="edit" class="d-flex align-center action-link mr-2">
              <v-icon small>mdi-pencil</v-icon>
              수정
            </span>
            <span @click="deletePost" class="d-flex align-center action-link">
              <v-icon small>mdi-trash-can-outline</v-icon>
              삭제&nbsp;&nbsp; 
            </span>
          </template>
          <span @click="openReportModal('post', post)" class="d-flex align-center action-link">
            <v-icon small>mdi-alarm-light-outline</v-icon>
            &nbsp;신고
          </span>
          <ReportPost
            v-if="showReportPostModal"
            :postId="reportData.postId"
            @close="closeReportPostModal"
            />
        </v-col>
      </div>

      <v-row class="mb-5 no-margin">
        <v-col cols="12" md="12">
          <v-card flat class="pa-0">
            <v-card-text>
              <div>
                <v-list-item-title class="text-subtitle-1" style="font-weight: bold; font-size: 30px !important; margin-bottom: 10px;">{{ postDetail.title }}</v-list-item-title>
                <v-list-item-subtitle style="font-size:20px; margin-bottom: 10px; line-height: 1.5;">{{ postDetail.content }}</v-list-item-subtitle>
              </div>
            </v-card-text>
            <div class="image-container">
              <v-img v-if="postDetail.postImgUrl" :src="postDetail.postImgUrl" alt="게시글 이미지" class="mb-3 rounded" />
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-col class="d-flex justify" style="flex-grow: 1;">
        <span @click="toggleLike" class="d-flex align-center action-link mr-2">
          <v-icon small>{{ liked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon> &nbsp; 좋아요 {{ postDetail.likeCount }}  · 
        </span>
        <span @click="showCommentTextarea = !showCommentTextarea" class="d-flex align-center action-link mr-2">
          <v-icon small>mdi-comment-outline</v-icon> &nbsp; 댓글 {{ postDetail.comments.length }} ·
        </span>
        <span class="d-flex align-center action-link">
          &nbsp;<v-icon small>mdi-eye-outline</v-icon> &nbsp; 조회수 {{ postDetail.viewCount }}   
        </span>
      </v-col>

      <v-divider></v-divider>

      <v-row v-if="showCommentTextarea" class="mt-3">
        <v-col cols="12">
          <v-form @submit.prevent="submitPostComment">
            <v-textarea
              v-model="newPostComment"
              label="댓글을 작성해주세요"
              outlined
              required
            ></v-textarea>
            <span 
              @click="submitPostComment" 
              class="d-flex align-center action-link mr-2" 
              style="cursor: pointer;"
            >
              <v-icon small>mdi-comment-outline</v-icon>&nbsp; 댓글 작성
            </span>
          </v-form>
        </v-col>
      </v-row>

      <v-row>
        <v-divider></v-divider>

        <v-col cols="12">
          <h4 class="text-h6 font-weight-bold">댓글</h4>
          <v-list>
            <v-list-item v-for="comment in postDetail.comments" :key="comment.id" class="py-2" style="padding: 10px;">
              <v-card :style="{ backgroundColor: comment.memberEmail === currentUserEmail ? '#F9F9F9' : '#ECF2FE', padding: '10px 5px 10px 25px' }" class="mb-2" outlined>
                <v-card-text>
                  <div class="d-flex justify-space-between align-center">
                    <div style="flex: 9;">
                      <div class="comment-text">
                        <v-list-item-title class="text-subtitle-1" style="font-weight: bold; font-size: 20px !important; margin-bottom: 8px;">
                          {{ comment.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle style="font-size: 18px; margin-bottom: 8px;">
                          <span v-if="!comment.isEditing">{{ comment.content }}</span>
                          <span v-else>
                            <v-textarea
                              v-model="comment.editContent"
                              label="수정할 댓글을 입력해주세요"
                              outlined
                              required
                            ></v-textarea>
                          </span>
                        </v-list-item-subtitle>
                        <v-list-item-subtitle>{{ formatDate(comment.createdTimeAt) }}</v-list-item-subtitle>
                      </div>                      
                    </div>
                    <div style="flex: 2.5;" class="d-flex align-center">
                      <span 
                        v-if="comment.doctorEmail === currentUserEmail && !comment.isEditing" 
                        @click="startEditComment(comment)" 
                        class="d-flex align-center action-link"
                      >
                        <v-icon small>mdi-pencil</v-icon> 수정&nbsp;&nbsp;
                      </span>
                      <span 
                        v-if="comment.doctorEmail === currentUserEmail && comment.isEditing" 
                        @click="updateComment(comment)" 
                        class="d-flex align-center action-link"
                      >
                        <v-icon small>mdi-pencil</v-icon> 수정하기
                      </span>
                      
                      <span 
                        v-if="comment.doctorEmail === currentUserEmail" 
                        @click="deleteComment(comment)" 
                        class="d-flex align-center action-link"
                      >
                        <v-icon small>mdi-trash-can-outline</v-icon> 삭제
                      </span>
                    
                      <!-- 신고 버튼은 항상 보이도록 -->
                      <span @click="openReportModal('comment', comment)" class="d-flex align-center action-link mr-2" 
                            style="margin-left: auto;">
                        <v-icon small>mdi-alarm-light-outline</v-icon> 신고
                      </span>
                      <ReportComment
                        v-if="showReportCommentModal"
                        :postId="reportData.postId"
                        :commentId="comment.commentId"
                        :reportedEmail="comment.doctorEmail"
                        :comments="postDetail.comments"
                        @close="closeReportCommentModal"
                      />
                    </div>                
                  </div>
                </v-card-text>
                <v-card-actions v-if="comment.isEditing">
                  <span 
                    @click="updateComment(comment)" 
                    class="d-flex align-center action-link"
                    style="cursor: pointer;"
                  >
                    <v-icon small>mdi-pencil</v-icon> 수정하기
                  </span>
                </v-card-actions>
                <v-card-actions>
                  <span @click="comment.showTextarea = !comment.showTextarea" class="d-flex align-center action-link mr-2">
                    <v-icon small>mdi-comment-outline</v-icon>&nbsp;댓글달기
                  </span>
                </v-card-actions>
                <v-form v-if="comment.showTextarea" @submit.prevent="submitComment(comment)">
                  <v-textarea
                    v-model="comment.newComment"
                    :label="comment.parentId ? getParentComment(comment.parentId).content : '대댓글을 작성해주세요'"
                    outlined
                    required
                  ></v-textarea>
                  <span 
                    @click="submitComment(comment)" 
                    class="d-flex align-center action-link mr-2" 
                    style="cursor: pointer;"
                  >
                    <v-icon small>mdi-comment-outline</v-icon> &nbsp; 대댓글 작성
                  </span>
                </v-form>
              </v-card>
              <!-- 대댓글 표시 -->
              <v-list v-if="comment.replies && comment.replies.length" class="ml-4">
                <v-list-item v-for="reply in comment.replies" :key="reply.id">
                  <v-card :style=" {padding: '10px 5px 10px 25px'}" class="mb-2 enlarged-reply-card" outlined>
                    <v-card-text>
                      <div class="d-flex justify-space-between align-center">
                        <div style="flex: 9;">
                          <div class="comment-text">
                            <v-list-item-title class="text-subtitle-1"> <v-icon small>mdi-arrow-right-bottom</v-icon>&nbsp;{{ reply.name }}</v-list-item-title>
                            <v-list-item-subtitle>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ reply.content }}</v-list-item-subtitle>
                            <v-list-item-subtitle>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ formatDate(reply.createdTimeAt) }}</v-list-item-subtitle>
                          </div>
                        </div>
                        <div style="flex: 1.7;" class="d-flex align-center">
                          <span v-if="reply.doctorEmail === currentUserEmail" @click="deleteReply(reply)" class="d-flex align-center action-link">
                            <v-icon small>mdi-trash-can-outline</v-icon> 삭제 &nbsp;
                          </span>
                          <span class="d-flex align-center action-link" 
                                :style="{ visibility: reply.doctorEmail === currentUserEmail ? 'visible' : 'hidden' }">
                            <v-icon small>mdi-alarm-light-outline</v-icon> 신고
                          </span>
                          <span v-if="reply.doctorEmail !== currentUserEmail" @click="openReportModal('reply', reply)" class="d-flex align-center action-link mr-2">
                            <v-icon>mdi-alarm-light-outline</v-icon> 신고
                          </span>
                          <ReportComment
                          v-if="showReportCommentModal"
                          :postId="reportData.postId"
                          :commentId="reportData.replyId"
                          :replyId="reply.replyId"
                          :reportedEmail="reply.doctorEmail"
                          :comments="postDetail.comments"
                          @close="closeReportCommentModal"
                          />     
                        </div>                        
                      </div>
                    </v-card-text>
                  </v-card>                  
                </v-list-item>
              </v-list>
            </v-list-item>                            
          </v-list>          
        </v-col>     
      </v-row>
    </v-card>
    <v-alert type="error" v-if="error">{{ error }}</v-alert>
  </v-container>
</template>


<script>
import axios from 'axios';
import ReportPost from './ReportPost.vue';
import ReportComment from './ReportComment.vue';

export default {
  components: {
    ReportPost,
    ReportComment,
  },
  data() {
    return {
      postDetail: null,
      error: null,
      showReportPostModal: false,
      showReportCommentModal: false,
      reportData: {},
      newPostComment: '',
      showCommentTextarea: false,
      liked: false, // 좋아요 상태
    };
  },
  created() {
    this.fetchPostDetail();
  },
  mounted() {
    this.currentUserEmail = localStorage.getItem('email');
  },
  methods: {
    edit() {
      this.$router.push(`/update/${this.postDetail.id}`);
    },
    async toggleLike() {
      const postId = this.postDetail.id;
      try {
        const action = this.liked ? 'unlike' : 'like';
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/community-service/post/detail/${action}/${postId}`);
        this.postDetail.likeCount += this.liked ? -1 : 1;
        this.liked = !this.liked;
      } catch (error) {
        console.error("좋아요 토글 중 오류가 발생했습니다.", error);
        this.error = '좋아요 토글에 실패했습니다.';
      }
    },
    deletePost() {
      if (confirm("게시글을 정말 삭제하시겠습니까?")) {
        axios.post(`${process.env.VUE_APP_API_BASE_URL}/community-service/post/delete/${this.postDetail.id}`)
          .then(() => this.$router.push('/community/list'))
          .catch(error => {
            console.error("게시글 삭제에 실패했습니다.", error);
            this.error = '게시글 삭제에 실패했습니다.';
          });
      }
    },
    async deleteReply(reply) {
      if (confirm("대댓글을 정말 삭제하시겠습니까?")) {
        try {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/community-service/comment/delete/${reply.id}`);
          this.fetchPostDetail();
        } catch (error) {
          console.error("대댓글 삭제에 실패했습니다.", error);
          this.error = '대댓글 삭제에 실패했습니다.';
        }
      }
    },
    async fetchPostDetail() {
      const postId = this.$route.params.id;
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/community-service/post/detail/${postId}`);
        this.postDetail = response.data.result;

        // 댓글 및 대댓글 초기화
        this.postDetail.comments.forEach(comment => {
          comment.showTextarea = false;
          comment.newComment = '';
          comment.replies = [];
        });

        // 대댓글 구조화
        this.postDetail.comments.forEach(comment => {
          if (comment.parentId) {
            const parentComment = this.postDetail.comments.find(c => c.id === comment.parentId);
            if (parentComment) {
              parentComment.replies.push(comment);
            }
          }
        });

        // 부모 댓글만 필터링하고 정렬
        this.postDetail.comments = this.postDetail.comments.filter(comment => !comment.parentId);
        this.postDetail.comments.sort((a, b) => new Date(a.createdTimeAt) - new Date(b.createdTimeAt));
      } catch (error) {
        console.error("게시글 정보를 불러오는 중 오류가 발생했습니다.", error);
        this.error = error.response ? error.response.data.message : '게시글 정보를 불러오는 중 오류가 발생했습니다.';
      }
    },
    async submitPostComment() {
      const postId = this.$route.params.id;
      try {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/community-service/comment/create`, {
          content: this.newPostComment,
          postId: postId,
          parentId: null,
        });
        this.newPostComment = '';
        this.showCommentTextarea = false;
        this.fetchPostDetail();
      } catch (error) {
        const message1 = error.response.data.status_message; // 에러 메시지 설정
        alert(message1);

      }
    },
    async submitComment(comment) {
      const postId = this.$route.params.id;
      try {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/community-service/comment/create`, {
          content: comment.newComment,
          postId: postId,
          parentId: comment.id,
        });
        comment.newComment = '';
        this.fetchPostDetail();
      } catch (error) {
        const message = error.response.data.status_message;
        alert(message);
        
      }
    },
    async deleteComment(comment) {
      if (confirm("댓글을 정말 삭제하시겠습니까?")) {
        try {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/community-service/comment/delete/${comment.id}`);
          this.fetchPostDetail();
        } catch (error) {
          console.error("댓글 삭제에 실패했습니다.", error);
          this.error = '댓글 삭제에 실패했습니다.';
        }
      }
    },
    openReportModal(type, comment = null) {
      this.reportData = {
        postId: this.postDetail.id,
        commentId: comment ? comment.id : null,
        replyId: comment && comment.parentId ? comment.id : null
      };
      if (type === 'post') {
        this.showReportPostModal = true;
      } else if (type === 'comment') {
        this.showReportCommentModal = true;
      } else if (type === 'reply') {
        this.showReportCommentModal = true;
      }
    },
    closeReportPostModal() {
      this.showReportPostModal = false;
    },
    closeReportCommentModal() {
      this.showReportCommentModal = false;
    },
    formatDate(date) {
      if (!date) return '';
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(date).toLocaleDateString('ko-KR', options);
    },
  },
};
</script>


<style scoped>
.pa-5{
  max-width: 770px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box; /* 패딩과 보더를 포함하여 너비를 계산 */
  background-color: #FCFCFC; /* 배경색 변경 */
}

.v-container {
  max-width: 900px;
  margin: 0 auto;
}

.text-body-1 {
  font-size: 1rem;
  line-height: 1.5;
  color: #000000;
}

.action-link {
  cursor: pointer;
  color: #6A6A6A; 
}

.action-link:hover {
  color: #0D47A1; 
}

h4.text-h6 {
  color: #6A6A6A;
}

h2.text-h5 {
  color: #333;
}

.v-btn {
  font-weight: bold;
  border-radius: 0;
  min-width: 100px;
}

.image-container {
  display: flex;
  justify-content: center; 
  align-items: center; 
}

.center-image {
  max-width: 60%;
  height: auto;
}

.btn_solid {
  background-color: #ffdb69 !important;
  color: rgb(255, 255, 255);
  border-radius: 8px;
}

.enlarged-reply-card {
  padding: 16px;
  margin: 8px 0;
  background-color: #f9f9f9;
}
</style>
