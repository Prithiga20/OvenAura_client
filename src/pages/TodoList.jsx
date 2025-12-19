import React, { useState, useEffect } from 'react';
import { Layout, Card, List, Button, Modal, Form, Input, Select, Checkbox, Typography, Tag, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import toast from 'react-hot-toast';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (error) {
      toast.error('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingTodo) {
        await api.put(`/todos/${editingTodo._id}`, values);
        toast.success('Todo updated successfully!');
      } else {
        await api.post('/todos', values);
        toast.success('Todo created successfully!');
      }
      setModalVisible(false);
      setEditingTodo(null);
      form.resetFields();
      fetchTodos();
    } catch (error) {
      toast.error('Failed to save todo');
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    form.setFieldsValue(todo);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      toast.success('Todo deleted successfully!');
      fetchTodos();
    } catch (error) {
      toast.error('Failed to delete todo');
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      await api.put(`/todos/${todo._id}`, { ...todo, completed: !todo.completed });
      fetchTodos();
    } catch (error) {
      toast.error('Failed to update todo');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = { low: 'green', medium: 'orange', high: 'red' };
    return colors[priority] || 'default';
  };

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Title level={2} className="text-cafe-800 font-serif">My To-Do List</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              className="btn-primary"
            >
              Add Task
            </Button>
          </div>

          {todos.length === 0 ? (
            <Card>
              <Empty description="No tasks found" />
            </Card>
          ) : (
            <Card>
              <List
                dataSource={todos}
                renderItem={(todo) => (
                  <List.Item
                    className={todo.completed ? 'opacity-60' : ''}
                    actions={[
                      <Button
                        type="text"
                        icon={<CheckOutlined />}
                        onClick={() => handleToggleComplete(todo)}
                        className={todo.completed ? 'text-green-600' : ''}
                      />,
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(todo)}
                      />,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(todo._id)}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div className="flex items-center space-x-2">
                          <Checkbox checked={todo.completed} onChange={() => handleToggleComplete(todo)} />
                          <span className={todo.completed ? 'line-through' : ''}>{todo.title}</span>
                          <Tag color={getPriorityColor(todo.priority)}>{todo.priority}</Tag>
                        </div>
                      }
                      description={
                        <div>
                          {todo.description && <Text className="text-gray-600">{todo.description}</Text>}
                          {todo.dueDate && (
                            <div className="mt-1">
                              <Text className="text-sm text-gray-500">
                                Due: {new Date(todo.dueDate).toLocaleDateString()}
                              </Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          <Modal
            title={editingTodo ? 'Edit Task' : 'Add New Task'}
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              setEditingTodo(null);
              form.resetFields();
            }}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="title"
                label="Task Title"
                rules={[{ required: true, message: 'Please enter task title!' }]}
              >
                <Input placeholder="Enter task title" />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Enter task description" />
              </Form.Item>

              <Form.Item name="priority" label="Priority" initialValue="medium">
                <Select>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>

              <Form.Item name="dueDate" label="Due Date">
                <Input type="date" />
              </Form.Item>

              <Form.Item>
                <div className="flex space-x-2">
                  <Button type="primary" htmlType="submit" className="btn-primary">
                    {editingTodo ? 'Update' : 'Create'} Task
                  </Button>
                  <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                </div>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default TodoList;