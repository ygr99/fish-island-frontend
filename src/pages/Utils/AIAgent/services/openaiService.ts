import OpenAI from 'openai';

// 定义消息接口
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  thinking?: string;
  reasoning_process?: string;
  error?: boolean;
  errorMessage?: string;
}

// 定义回调接口
export interface AIResponseCallbacks {
  onMessage: (content: string) => void;
  onReasoningProcess?: (content: string) => void;
  onError: (error: Error | string) => void;
  onComplete: () => void;
}

// 定义基础AI服务接口
export interface AIService {
  sendMessage(
    content: string, 
    useWebSearch: boolean, 
    callbacks: AIResponseCallbacks
  ): Promise<void>;
  
  cancel(): void;
} 

// 模型配置接口
export interface ModelConfig {
  key: string;
  name: string;
  provider: string;
  icon: string;
  accessKey?: string;
  apiEndpoint?: string;
  modelType?: string; // 添加modelType字段，用于存储具体的模型类型
  openaiCompatible?: boolean; // 是否兼容OpenAI API格式
}

// 消息类型
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
}

// SSE 回调函数类型
export type SSECallback = {
  onMessage: (content: string) => void;
  onReasoningProcess?: (content: string) => void;
  onError: (error: any) => void;
  onComplete: () => void;
};

/**
 * 基于OpenAI库的AI服务类
 * 可以处理所有OpenAI API兼容的模型
 */
export class OpenAIService {
  private modelConfig: ModelConfig;
  private messages: Message[];
  private client: OpenAI | null = null;
  private abortController: AbortController | null = null;

  constructor(modelConfig: ModelConfig, messages: Message[] = []) {
    this.modelConfig = modelConfig;
    this.messages = messages;
    this.initClient();
  }

  /**
   * 初始化OpenAI客户端
   */
  private initClient() {
    if (!this.modelConfig.accessKey) {
      return;
    }

    this.client = new OpenAI({
      apiKey: this.modelConfig.accessKey,
      baseURL: this.modelConfig.apiEndpoint,
      dangerouslyAllowBrowser: true
    });
  }

  /**
   * 发送消息到AI模型
   * @param message 用户消息
   * @param useWebSearch 是否使用联网搜索
   * @param callbacks SSE回调函数
   */
  async sendMessage(
    message: string,
    useWebSearch: boolean,
    callbacks: SSECallback
  ): Promise<void> {
    // 取消之前的请求
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.abortController = new AbortController();
    
    try {
      if (!this.client) {
        this.initClient();
        if (!this.client) {
          throw new Error('OpenAI客户端初始化失败，请检查API密钥');
        }
      }
      
      // 准备历史消息
      const historyMessages = this.messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system')
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      // 使用modelType作为具体模型标识，如果不存在则使用key
      const modelIdentifier = this.modelConfig.modelType || this.modelConfig.key;
      
      // 创建聊天完成请求
      const stream = await this.client.chat.completions.create({
        model: modelIdentifier,
        messages: [
          ...historyMessages as any,
          { role: 'user', content: message }
        ],
        stream: true,
        temperature: 0.7,
        tools: useWebSearch ? [
          {
            type: "function",
            function: {
              name: "search",
              description: "Search the web for information",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query"
                  }
                },
                required: ["query"]
              }
            }
          }
        ] : undefined,
      }, { signal: this.abortController.signal });
      
      // 处理流式响应
      for await (const chunk of stream) {
        // 检查常规内容字段
        const content = chunk.choices[0]?.delta?.content || '';
        // 检查推理过程字段 (deepseek r1等模型)
        // 使用类型断言访问非标准字段
        const reasoningContent = (chunk.choices[0]?.delta as any)?.reasoning_content || '';
        
        if (content) {
          callbacks.onMessage(content);
          // 添加小延迟以确保UI有时间更新
          await new Promise(resolve => setTimeout(resolve, 5));
        }
        
        // 如果有推理过程且回调存在，则调用推理过程回调
        if (reasoningContent && callbacks.onReasoningProcess) {
          callbacks.onReasoningProcess(reasoningContent);
          // 添加小延迟以确保UI有时间更新
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      }

      callbacks.onComplete();
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('AI请求错误:', error);
        
        // 尝试提取详细的错误信息
        let errorMessage = '';
        
        try {
          if (error.response && error.response.data) {
            // 处理标准HTTP响应错误
            errorMessage = JSON.stringify(error.response.data, null, 2);
          } else if (error.message) {
            // 使用错误消息
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            // 直接使用错误字符串
            errorMessage = error;
          } else {
            // 尝试转换为字符串
            errorMessage = JSON.stringify(error, null, 2);
          }
        } catch (e) {
          // 如果提取出错，使用简单的消息
          errorMessage = '未能解析错误详情';
        }
        
        callbacks.onError(errorMessage || '请求失败');
      }
    } finally {
      this.abortController = null;
    }
  }
  
  /**
   * 取消当前请求
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

export default OpenAIService; 